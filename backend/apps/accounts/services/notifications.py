from typing import Optional

from django.contrib.auth.models import User

from apps.accounts.models import ConversationMessage, Notification, PurchaseOrder, UserProfile
from apps.accounts.services.emails import (
    build_frontend_url,
    send_admin_order_paid_email,
    send_customer_message_alert_email,
    send_order_failed_email,
    send_order_paid_email,
    send_support_reply_email,
)


def create_notification(
    *,
    user: User,
    type: str,
    title: str,
    body: str = "",
    link: str = "",
    metadata: Optional[dict] = None,
) -> Notification:
    return Notification.objects.create(
        user=user,
        type=type,
        title=title,
        body=body,
        link=link,
        metadata=metadata or {},
    )


def _should_email_user(user: User) -> bool:
    profile, _ = UserProfile.objects.get_or_create(user=user)
    return not profile.is_online and bool(user.email)


def _can_email_user(user: User) -> bool:
    return bool((user.email or "").strip())


def notify_order_paid(order: PurchaseOrder):
    link = f"/dashboard/orders/{order.id}"
    email_link = build_frontend_url(link)
    amount_paid = f"${order.amount}"
    payment_provider = (order.provider or "").capitalize()

    create_notification(
        user=order.user,
        type="order_paid",
        title=f"Payment confirmed for {order.product.name}",
        body="Your order has been paid successfully and access is now available.",
        link=link,
        metadata={"order_id": order.id, "payment_reference": order.payment_reference},
    )

    if _can_email_user(order.user):
        send_order_paid_email(
            recipient=order.user.email,
            customer_name=order.user.get_full_name() or order.user.first_name or "Customer",
            product_name=order.product.name,
            order_reference=order.payment_reference,
            dashboard_url=email_link,
            amount_paid=amount_paid,
            payment_provider=payment_provider,
        )

    admin_recipients = list(User.objects.filter(is_staff=True, is_active=True))
    for admin in admin_recipients:
        create_notification(
            user=admin,
            type="admin_alert",
            title=f"Order payment received for {order.product.name}",
            body=f"{order.user.email or 'A customer'} completed payment successfully.",
            link=link,
            metadata={"order_id": order.id, "payment_reference": order.payment_reference, "event": "order_paid"},
        )
        if _can_email_user(admin):
            send_admin_order_paid_email(
                recipient=admin.email,
                admin_name=admin.get_full_name() or admin.first_name or "Admin",
                customer_name=order.user.get_full_name() or order.user.first_name or order.user.username or "Customer",
                customer_email=order.user.email or "-",
                product_name=order.product.name,
                order_reference=order.payment_reference,
                amount_paid=amount_paid,
                payment_provider=payment_provider,
                order_url=email_link,
            )


def notify_order_failed(order: PurchaseOrder):
    link = f"/products/{order.product.slug}"
    email_link = build_frontend_url(link)
    create_notification(
        user=order.user,
        type="order_failed",
        title=f"Payment failed for {order.product.name}",
        body="We could not confirm your payment. Please try again.",
        link=link,
        metadata={"order_id": order.id, "payment_reference": order.payment_reference},
    )

    if _should_email_user(order.user):
        send_order_failed_email(
            recipient=order.user.email,
            customer_name=order.user.get_full_name() or order.user.first_name or "Customer",
            product_name=order.product.name,
            order_reference=order.payment_reference,
            product_url=email_link,
        )


def notify_new_message(message: ConversationMessage):
    order = message.order
    sender = message.sender
    sender_name = sender.get_full_name() or sender.email or "User"
    message_content = (message.message or "").strip()
    order_link = f"/dashboard/orders/{order.id}"
    order_email_link = build_frontend_url(order_link)

    if message.is_admin:
        recipients = [order.user]
        title = f"New support reply for {order.product.name}"
        body = message_content or "Admin replied to your order conversation."
    else:
        recipients = list(User.objects.filter(is_staff=True, is_active=True))
        title = f"Customer message for {order.product.name}"
        body = message_content or f"{sender_name} sent a new support message."

    for recipient in recipients:
        create_notification(
            user=recipient,
            type="new_message",
            title=title,
            body=body,
            link=order_link,
            metadata={"order_id": order.id, "message_id": message.id},
        )

        if _can_email_user(recipient):
            if message.is_admin:
                send_support_reply_email(
                    recipient=recipient.email,
                    customer_name=recipient.get_full_name() or recipient.first_name or "Customer",
                    product_name=order.product.name,
                    order_reference=order.payment_reference,
                    sender_name=sender_name,
                    message_content=message_content,
                    order_url=order_email_link,
                )
            else:
                send_customer_message_alert_email(
                    recipient=recipient.email,
                    admin_name=recipient.get_full_name() or recipient.first_name or "Admin",
                    product_name=order.product.name,
                    order_reference=order.payment_reference,
                    sender_name=sender_name,
                    message_content=message_content,
                    order_url=order_email_link,
                )
