import hashlib
import hmac
import json
import uuid
from decimal import Decimal
from typing import Any, Dict, Tuple

import requests
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import PaymentEventLog, PurchaseOrder
from apps.catalog.models import Product
from apps.core.models import PaymentSettings

try:
    import stripe
except Exception:
    stripe = None


class PaymentError(Exception):
    pass


def _log_event(
    *,
    order: PurchaseOrder,
    event_type: str,
    status: str = "",
    reference: str = "",
    payload: Dict[str, Any] | None = None,
    note: str = "",
):
    PaymentEventLog.objects.create(
        order=order,
        provider=order.provider,
        event_type=event_type,
        status=status,
        reference=reference,
        payload=payload or {},
        note=note,
    )


def _frontend_base_url() -> str:
    from django.conf import settings
    return getattr(settings, "FRONTEND_BASE_URL", "").rstrip("/")


def _make_payment_reference() -> str:
    return f"ORD-{uuid.uuid4().hex[:14].upper()}"


def _resolve_subscription_recurring(order: PurchaseOrder) -> Tuple[str, int]:
    source = f"{order.subscription_plan_id} {order.subscription_billing_period}".lower()
    if any(token in source for token in ["month", "monthly"]):
        interval = "month"
        count = 1
    elif any(token in source for token in ["quarter", "quarterly", "3 month", "3-month"]):
        interval = "month"
        count = 3
    elif any(token in source for token in ["year", "yearly", "annual", "annually", "12 month"]):
        interval = "year"
        count = 1
    else:
        raise PaymentError("Unsupported subscription billing period for Stripe.")
    return interval, count


def _resolve_fulfillment(product: Product) -> Tuple[str, str, str, str]:
    delivery_type = product.delivery_type or "none"
    access_url = product.access_url or ""
    access_label = product.access_label or ""
    access_instructions = product.access_instructions or ""

    if delivery_type not in {"none", "download", "access", "both"}:
        delivery_type = "none"

    return delivery_type, access_url, access_label, access_instructions


def get_or_create_pending_order(
    *,
    user: User,
    product: Product,
    provider: str,
    idempotency_key: str,
    purchase_mode: str = "one_time",
    subscription_plan_id: str = "",
) -> PurchaseOrder:
    pay_settings = PaymentSettings.load()

    existing = PurchaseOrder.objects.filter(
        user=user,
        product=product,
        provider=provider,
        idempotency_key=idempotency_key,
    ).first()
    if existing:
        return existing

    fulfillment_type, access_url, access_label, access_instructions = _resolve_fulfillment(product)

    resolved_purchase_mode = "subscription" if purchase_mode == "subscription" else "one_time"
    resolved_plan_id = ""
    resolved_plan_name = ""
    resolved_billing_period = ""

    if resolved_purchase_mode == "subscription":
        if not product.subscription_enabled:
            raise PaymentError("Subscription mode is not enabled for this product.")
        plans = product.normalized_subscription_plans()
        selected_plan = next((plan for plan in plans if plan["id"] == (subscription_plan_id or "").strip()), None)
        if not selected_plan:
            raise PaymentError("Subscription plan not found for this product.")
        effective_price_usd = Decimal(str(selected_plan["price_usd"]))
        resolved_plan_id = selected_plan["id"]
        resolved_plan_name = selected_plan["name"]
        resolved_billing_period = selected_plan["billing_period"]
        if fulfillment_type == "download":
            raise PaymentError("Download-only products cannot be sold in subscription mode. Add access fulfillment first.")
        if fulfillment_type == "both" and not access_url:
            raise PaymentError("Subscription mode requires an access URL when delivery type includes access.")
    else:
        effective_price_usd = product.current_price_usd(now=timezone.now())

    with transaction.atomic():
        download_url = ""
        resolved_fulfillment_type = fulfillment_type
        if resolved_purchase_mode == "one_time":
            download_url = product.downloadable_zip_url or ""
        else:
            if fulfillment_type == "both":
                resolved_fulfillment_type = "access"
            elif fulfillment_type == "download":
                resolved_fulfillment_type = "none"

        order = PurchaseOrder.objects.create(
            user=user,
            product=product,
            provider=provider,
            amount=effective_price_usd,
            amount_ngn=Decimal(effective_price_usd) * Decimal(pay_settings.usd_ngn_rate),
            purchase_mode=resolved_purchase_mode,
            subscription_plan_id=resolved_plan_id,
            subscription_plan_name=resolved_plan_name,
            subscription_billing_period=resolved_billing_period,
            payment_reference=_make_payment_reference(),
            idempotency_key=idempotency_key,
            fulfillment_type=resolved_fulfillment_type,
            access_url=access_url,
            access_label=access_label,
            access_instructions=access_instructions,
            delivery_payload={
                "download_url": download_url,
            },
        )
    return order


def initialize_stripe_checkout(order: PurchaseOrder) -> Dict[str, Any]:
    settings = PaymentSettings.load()

    if not settings.stripe_secret_key:
        raise PaymentError("Stripe is not configured.")

    if stripe is None:
        raise PaymentError("Stripe SDK is not installed.")

    stripe.api_key = settings.stripe_secret_key

    frontend_base = _frontend_base_url()
    if not frontend_base:
        raise PaymentError("FRONTEND_BASE_URL is not configured.")

    success_url = (
        f"{frontend_base}/dashboard/orders/{order.id}"
        f"?payment=success&provider=stripe&session_id={{CHECKOUT_SESSION_ID}}"
    )
    cancel_url = f"{frontend_base}/products/{order.product.slug}?payment=cancelled"

    amount_usd = Decimal(order.amount or 0)
    if amount_usd <= 0:
        raise PaymentError("Invalid USD amount for Stripe checkout.")

    unit_amount = int(amount_usd * 100)
    if unit_amount <= 0:
        raise PaymentError("Invalid Stripe unit amount.")

    session_mode = "subscription" if order.purchase_mode == "subscription" else "payment"
    session_payload = {
        "mode": session_mode,
        "success_url": success_url,
        "cancel_url": cancel_url,
        "payment_method_types": ["card"],
        "metadata": {
            "order_id": str(order.id),
            "payment_reference": order.payment_reference,
            "user_id": str(order.user_id),
            "product_slug": order.product.slug,
            "purchase_mode": order.purchase_mode,
            "subscription_plan_id": order.subscription_plan_id or "",
        },
    }

    common_product_data = {
        "name": order.product.name,
        "description": (
            f"{order.subscription_plan_name} ({order.subscription_billing_period}) subscription"
            if order.purchase_mode == "subscription"
            else (order.product.tagline or order.product.short_description or "")
        ),
    }

    if order.purchase_mode == "subscription":
        recurring_interval, recurring_count = _resolve_subscription_recurring(order)
        session_payload["line_items"] = [
            {
                "quantity": 1,
                "price_data": {
                    "currency": "usd",
                    "unit_amount": unit_amount,
                    "recurring": {
                        "interval": recurring_interval,
                        "interval_count": recurring_count,
                    },
                    "product_data": common_product_data,
                },
            }
        ]
    else:
        session_payload["line_items"] = [
            {
                "quantity": 1,
                "price_data": {
                    "currency": "usd",
                    "unit_amount": unit_amount,
                    "product_data": common_product_data,
                },
            }
        ]

    if order.user.email:
        session_payload["customer_email"] = order.user.email

    try:
        session = stripe.checkout.Session.create(**session_payload)
    except Exception as exc:
        raise PaymentError(f"Stripe checkout initialization failed: {str(exc)}") from exc

    order.provider_reference = getattr(session, "id", "") or ""
    order.provider_checkout_url = getattr(session, "url", "") or ""
    order.provider_status = getattr(session, "status", "") or ""
    order.provider_payload = {
        "checkout_session_id": getattr(session, "id", "") or "",
        "success_url": success_url,
        "cancel_url": cancel_url,
    }
    order.save(
        update_fields=[
            "provider_reference",
            "provider_checkout_url",
            "provider_status",
            "provider_payload",
            "updated_at",
        ]
    )

    _log_event(
        order=order,
        event_type="initialize",
        status=order.provider_status,
        reference=order.provider_reference,
        payload={"checkout_url": order.provider_checkout_url},
        note="Stripe checkout initialized.",
    )

    return {
        "order_id": order.id,
        "payment_reference": order.payment_reference,
        "provider": "stripe",
        "checkout_url": order.provider_checkout_url,
        "status": order.status,
    }


def initialize_paystack_checkout(order: PurchaseOrder) -> Dict[str, Any]:
    settings = PaymentSettings.load()
    if not settings.paystack_secret_key:
        raise PaymentError("Paystack is not configured.")

    frontend_base = _frontend_base_url()
    if not frontend_base:
        raise PaymentError("FRONTEND_BASE_URL is not configured.")

    callback_url = (
        f"{frontend_base}/dashboard/orders/{order.id}"
        f"?payment=success&provider=paystack&reference={order.payment_reference}"
    )

    payload = {
        "email": order.user.email,
        "amount": int(Decimal(order.amount_ngn) * 100),
        "reference": order.payment_reference,
        "currency": "NGN",
        "callback_url": callback_url,
        "metadata": {
            "order_id": order.id,
            "payment_reference": order.payment_reference,
            "product_slug": order.product.slug,
            "user_id": order.user_id,
            "purchase_mode": order.purchase_mode,
            "subscription_plan_id": order.subscription_plan_id or "",
        },
    }

    response = requests.post(
        "https://api.paystack.co/transaction/initialize",
        headers={
            "Authorization": f"Bearer {settings.paystack_secret_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=20,
    )
    response.raise_for_status()
    body = response.json()

    if not body.get("status"):
        raise PaymentError(body.get("message") or "Paystack initialization failed.")

    data = body.get("data") or {}
    order.provider_reference = data.get("reference") or order.payment_reference
    order.provider_checkout_url = data.get("authorization_url") or ""
    order.provider_status = "initialized"
    order.provider_payload = data
    order.save(
        update_fields=[
            "provider_reference",
            "provider_checkout_url",
            "provider_status",
            "provider_payload",
            "updated_at",
        ]
    )

    _log_event(
        order=order,
        event_type="initialize",
        status=order.provider_status,
        reference=order.provider_reference or "",
        payload=data,
        note="Paystack checkout initialized.",
    )

    return {
        "order_id": order.id,
        "payment_reference": order.payment_reference,
        "provider": "paystack",
        "checkout_url": order.provider_checkout_url,
        "status": order.status,
    }


def initialize_payment(order: PurchaseOrder) -> Dict[str, Any]:
    if order.provider == "stripe":
        return initialize_stripe_checkout(order)
    if order.provider == "paystack":
        return initialize_paystack_checkout(order)
    raise PaymentError("Unsupported payment provider.")


def mark_order_paid(
    order: PurchaseOrder,
    *,
    provider_status: str,
    payload: Dict[str, Any],
    provider_transaction_id: str = "",
    webhook_verified: bool = False,
):
    if order.status == "paid":
        if webhook_verified and not order.webhook_verified:
            order.webhook_verified = True
            order.save(update_fields=["webhook_verified", "updated_at"])
            _log_event(
                order=order,
                event_type="status_change",
                status="paid",
                reference=provider_transaction_id or order.provider_transaction_id or "",
                payload=payload,
                note="Webhook verification attached to already-paid order.",
            )
        return order

    order.status = "paid"
    order.provider_status = provider_status
    order.provider_payload = payload or {}
    order.provider_transaction_id = provider_transaction_id or order.provider_transaction_id
    order.webhook_verified = webhook_verified or order.webhook_verified
    order.paid_at = timezone.now()
    order.fulfilled_at = timezone.now()
    order.save(
        update_fields=[
            "status",
            "provider_status",
            "provider_payload",
            "provider_transaction_id",
            "webhook_verified",
            "paid_at",
            "fulfilled_at",
            "updated_at",
        ]
    )

    _log_event(
        order=order,
        event_type="status_change",
        status="paid",
        reference=provider_transaction_id or "",
        payload=payload,
        note="Order marked paid.",
    )
    return order


def mark_order_failed(order: PurchaseOrder, *, provider_status: str, payload: Dict[str, Any]):
    if order.status == "paid":
        return order

    order.status = "failed"
    order.provider_status = provider_status
    order.provider_payload = payload or {}
    order.save(update_fields=["status", "provider_status", "provider_payload", "updated_at"])

    _log_event(
        order=order,
        event_type="status_change",
        status="failed",
        reference=order.provider_reference or "",
        payload=payload,
        note="Order marked failed.",
    )
    return order


def confirm_stripe_payment(order: PurchaseOrder, session_id: str = "") -> PurchaseOrder:
    settings = PaymentSettings.load()
    if not settings.stripe_secret_key:
        raise PaymentError("Stripe is not configured.")
    if stripe is None:
        raise PaymentError("Stripe SDK is not installed.")

    stripe.api_key = settings.stripe_secret_key
    lookup_session_id = (session_id or order.provider_reference or "").strip()
    if not lookup_session_id:
        raise PaymentError("Stripe session reference is missing.")

    try:
        session = stripe.checkout.Session.retrieve(lookup_session_id)
    except Exception as exc:
        raise PaymentError(f"Stripe verification failed: {str(exc)}") from exc

    payment_status = (getattr(session, "payment_status", "") or "").lower()
    status = (getattr(session, "status", "") or "").lower()

    try:
        payload = session.to_dict_recursive()
    except Exception:
        payload = {
            "id": getattr(session, "id", "") or "",
            "payment_status": payment_status,
            "status": status,
            "payment_intent": getattr(session, "payment_intent", "") or "",
            "customer_email": getattr(session, "customer_email", "") or "",
        }

    _log_event(
        order=order,
        event_type="verify",
        status=status or payment_status,
        reference=lookup_session_id,
        payload=payload,
        note="Stripe payment verification requested.",
    )

    if payment_status == "paid":
        payment_intent = str(payload.get("payment_intent") or getattr(session, "payment_intent", "") or "")
        return mark_order_paid(
            order,
            provider_status=status or payment_status,
            payload=payload,
            provider_transaction_id=payment_intent,
            webhook_verified=False,
        )

    if status in {"expired", "canceled"}:
        return mark_order_failed(order, provider_status=status, payload=payload)

    return order

def confirm_paystack_payment(order: PurchaseOrder) -> PurchaseOrder:
    settings = PaymentSettings.load()
    if not settings.paystack_secret_key:
        raise PaymentError("Paystack is not configured.")

    response = requests.get(
        f"https://api.paystack.co/transaction/verify/{order.payment_reference}",
        headers={"Authorization": f"Bearer {settings.paystack_secret_key}"},
        timeout=20,
    )
    response.raise_for_status()
    body = response.json()

    if not body.get("status"):
        raise PaymentError(body.get("message") or "Paystack verification failed.")

    data = body.get("data") or {}
    provider_status = str(data.get("status") or "").lower()

    _log_event(
        order=order,
        event_type="verify",
        status=provider_status,
        reference=order.payment_reference,
        payload=data,
        note="Paystack payment verification requested.",
    )

    if provider_status == "success":
        return mark_order_paid(
            order,
            provider_status=provider_status,
            payload=data,
            provider_transaction_id=str(data.get("id") or ""),
            webhook_verified=False,
        )

    if provider_status in {"failed", "abandoned"}:
        return mark_order_failed(order, provider_status=provider_status, payload=data)

    return order


def confirm_payment(order: PurchaseOrder, *, session_id: str = "") -> PurchaseOrder:
    if order.provider == "stripe":
        return confirm_stripe_payment(order, session_id=session_id)
    if order.provider == "paystack":
        return confirm_paystack_payment(order)
    raise PaymentError("Unsupported payment provider.")


def process_stripe_webhook(payload: bytes, signature: str):
    settings = PaymentSettings.load()
    if not settings.stripe_secret_key:
        raise PaymentError("Stripe is not configured.")
    endpoint_secret = (settings.stripe_webhook_secret or "").strip()
    if not endpoint_secret:
        raise PaymentError("Stripe webhook secret is not configured.")
    if stripe is None:
        raise PaymentError("Stripe SDK is not installed.")

    stripe.api_key = settings.stripe_secret_key

    try:
        event = stripe.Webhook.construct_event(payload, signature, endpoint_secret)
    except Exception as exc:
        raise PaymentError("Invalid Stripe webhook signature.") from exc

    event_type = event.get("type")
    data_object = (event.get("data") or {}).get("object") or {}

    payment_reference = ((data_object.get("metadata") or {}).get("payment_reference")) or ""
    order = PurchaseOrder.objects.filter(payment_reference=payment_reference).first()

    if order:
        _log_event(
            order=order,
            event_type="webhook",
            status=event_type,
            reference=str(data_object.get("id") or ""),
            payload=data_object,
            note="Stripe webhook received.",
        )

    if event_type == "checkout.session.completed":
        if order:
            mark_order_paid(
                order,
                provider_status=str(data_object.get("status") or "completed"),
                payload=data_object,
                provider_transaction_id=str(data_object.get("payment_intent") or ""),
                webhook_verified=True,
            )
    elif event_type in {"checkout.session.expired", "payment_intent.payment_failed"}:
        if order:
            mark_order_failed(
                order,
                provider_status=str(data_object.get("status") or event_type),
                payload=data_object,
            )


def verify_paystack_signature(payload: bytes, signature: str) -> bool:
    secret = PaymentSettings.load().paystack_secret_key or ""
    if not secret or not signature:
        return False
    digest = hmac.new(secret.encode("utf-8"), payload, hashlib.sha512).hexdigest()
    return hmac.compare_digest(digest, signature)


def process_paystack_webhook(payload: bytes, signature: str):
    if not verify_paystack_signature(payload, signature):
        raise PaymentError("Invalid Paystack webhook signature.")

    body = json.loads(payload.decode("utf-8"))
    event = body.get("event")
    data = body.get("data") or {}
    reference = data.get("reference") or ""
    order = PurchaseOrder.objects.filter(payment_reference=reference).first()

    if order:
        _log_event(
            order=order,
            event_type="webhook",
            status=event,
            reference=reference,
            payload=data,
            note="Paystack webhook received.",
        )

    if event == "charge.success" and order:
        mark_order_paid(
            order,
            provider_status=str(data.get("status") or "success"),
            payload=data,
            provider_transaction_id=str(data.get("id") or ""),
            webhook_verified=True,
        )
