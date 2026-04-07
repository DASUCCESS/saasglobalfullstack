from typing import Optional

from django.contrib.auth.models import User

from apps.accounts.models import ConversationMessage, Notification, PurchaseOrder, UserProfile
from apps.accounts.services.emails import (
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


def notify_order_paid(order: PurchaseOrder):
    link = f"/dashboard/orders/{order.id}"
    create_notification(
        user=order.user,
        type="order_paid",
        title=f"Payment confirmed for {order.product.name}",
        body="Your order has been paid successfully and access is now available.",
        link=link,
        metadata={"order_id": order.id, "payment_reference": order.payment_reference},
    )

    if _should_email_user(order.user):
        send_order_paid_email(
            recipient=order.user.email,
            customer_name=order.user.get_full_name() or order.user.first_name or "Customer",
            product_name=order.product.name,
            order_reference=order.payment_reference,
            dashboard_url=link,
        )


def notify_order_failed(order: PurchaseOrder):
    link = f"/products/{order.product.slug}"
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
            product_url=link,
        )


def notify_new_message(message: ConversationMessage):
    order = message.order
    sender = message.sender
    sender_name = sender.get_full_name() or sender.email or "User"
    order_link = f"/dashboard/orders/{order.id}"

    if message.is_admin:
        recipients = [order.user]
        title = f"New support reply for {order.product.name}"
        body = "Admin replied to your order conversation."
    else:
        recipients = list(User.objects.filter(is_staff=True, is_active=True))
        title = f"Customer message for {order.product.name}"
        body = f"{sender_name} sent a new support message."

    for recipient in recipients:
        create_notification(
            user=recipient,
            type="new_message",
            title=title,
            body=body,
            link=order_link,
            metadata={"order_id": order.id, "message_id": message.id},
        )

        if _should_email_user(recipient):
            if message.is_admin:
                send_support_reply_email(
                    recipient=recipient.email,
                    customer_name=recipient.get_full_name() or recipient.first_name or "Customer",
                    product_name=order.product.name,
                    order_reference=order.payment_reference,
                    sender_name=sender_name,
                    order_url=order_link,
                )
            else:
                send_customer_message_alert_email(
                    recipient=recipient.email,
                    admin_name=recipient.get_full_name() or recipient.first_name or "Admin",
                    product_name=order.product.name,
                    order_reference=order.payment_reference,
                    sender_name=sender_name,
                    order_url=order_link,
                )