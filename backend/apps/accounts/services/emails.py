from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string

from apps.core.models import ContactSettings


def build_frontend_url(path: str) -> str:
    cleaned_path = (path or "").strip()
    if not cleaned_path:
        return ""
    if cleaned_path.startswith("http://") or cleaned_path.startswith("https://"):
        return cleaned_path

    base_url = getattr(settings, "FRONTEND_BASE_URL", "").rstrip("/")
    if not base_url:
        return cleaned_path
    if not cleaned_path.startswith("/"):
        cleaned_path = f"/{cleaned_path}"
    return f"{base_url}{cleaned_path}"


def _get_platform_email_config():
    contact = ContactSettings.load()

    host = (contact.smtp_host or "").strip() or getattr(settings, "EMAIL_HOST", "")
    port = contact.smtp_port or getattr(settings, "EMAIL_PORT", 587)
    username = (contact.smtp_username or "").strip() or getattr(settings, "EMAIL_HOST_USER", "")
    password = (contact.smtp_password or "").strip() or getattr(settings, "EMAIL_HOST_PASSWORD", "")
    use_tls = contact.smtp_use_tls if contact.smtp_host else getattr(settings, "EMAIL_USE_TLS", True)
    configured_ssl = bool(getattr(settings, "EMAIL_USE_SSL", False))
    use_ssl = configured_ssl
    if contact.smtp_host:
        use_ssl = (not use_tls and int(port) == 465) or (not use_tls and configured_ssl)

    sender = (
        (contact.from_email or "").strip()
        or getattr(settings, "DEFAULT_FROM_EMAIL", "")
        or username
    )

    return {
        "host": host,
        "port": port,
        "username": username,
        "password": password,
        "use_tls": use_tls,
        "use_ssl": use_ssl,
        "sender": sender,
    }


def send_platform_email(
    *,
    subject: str,
    recipient_list: list[str],
    template_name: str,
    context: dict,
    from_email: str | None = None,
) -> bool:
    if not recipient_list:
        return False

    config = _get_platform_email_config()
    sender = from_email or config["sender"]

    if not sender or not config["host"] or not config["port"]:
        return False

    html_body = render_to_string(template_name, context)
    text_body = render_to_string("emails/base.txt", context)

    connection = get_connection(
        backend="django.core.mail.backends.smtp.EmailBackend",
        host=config["host"],
        port=config["port"],
        username=config["username"],
        password=config["password"],
        use_tls=config["use_tls"],
        use_ssl=config["use_ssl"],
        timeout=getattr(settings, "EMAIL_TIMEOUT", 20),
        fail_silently=False,
    )

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=sender,
        to=recipient_list,
        connection=connection,
    )
    email.attach_alternative(html_body, "text/html")

    sent_count = email.send()
    return sent_count > 0


def send_order_paid_email(
    *,
    recipient: str,
    customer_name: str,
    product_name: str,
    order_reference: str,
    dashboard_url: str,
    amount_paid: str,
    payment_provider: str,
):
    return send_platform_email(
        subject=f"Payment confirmed: {product_name}",
        recipient_list=[recipient],
        template_name="emails/order_paid.html",
        context={
            "preview_text": f"Your payment for {product_name} has been confirmed.",
            "headline": "Payment Confirmed",
            "customer_name": customer_name,
            "product_name": product_name,
            "order_reference": order_reference,
            "amount_paid": amount_paid,
            "payment_provider": payment_provider,
            "dashboard_url": dashboard_url,
            "cta_label": "Open Dashboard",
            "site_name": "SaaSGlobal Hub",
        },
    )


def send_order_failed_email(
    *,
    recipient: str,
    customer_name: str,
    product_name: str,
    order_reference: str,
    product_url: str,
):
    return send_platform_email(
        subject=f"Payment failed: {product_name}",
        recipient_list=[recipient],
        template_name="emails/order_failed.html",
        context={
            "preview_text": f"We could not confirm your payment for {product_name}.",
            "headline": "Payment Could Not Be Confirmed",
            "customer_name": customer_name,
            "product_name": product_name,
            "order_reference": order_reference,
            "product_url": product_url,
            "cta_label": "Return to Product",
            "site_name": "SaaSGlobal Hub",
        },
    )


def send_support_reply_email(
    *,
    recipient: str,
    customer_name: str,
    product_name: str,
    order_reference: str,
    sender_name: str,
    message_content: str,
    order_url: str,
):
    return send_platform_email(
        subject=f"New support reply for order {order_reference}",
        recipient_list=[recipient],
        template_name="emails/support_reply.html",
        context={
            "preview_text": f"You received a new support reply for {product_name}.",
            "headline": "New Support Reply",
            "customer_name": customer_name,
            "product_name": product_name,
            "order_reference": order_reference,
            "sender_name": sender_name,
            "message_content": message_content,
            "order_url": order_url,
            "cta_label": "Open Conversation",
            "site_name": "SaaSGlobal Hub",
        },
    )


def send_customer_message_alert_email(
    *,
    recipient: str,
    admin_name: str,
    product_name: str,
    order_reference: str,
    sender_name: str,
    message_content: str,
    order_url: str,
):
    return send_platform_email(
        subject=f"Customer message for order {order_reference}",
        recipient_list=[recipient],
        template_name="emails/customer_message_alert.html",
        context={
            "preview_text": f"A customer sent a new message for {product_name}.",
            "headline": "New Customer Message",
            "admin_name": admin_name,
            "product_name": product_name,
            "order_reference": order_reference,
            "sender_name": sender_name,
            "message_content": message_content,
            "order_url": order_url,
            "cta_label": "Review Message",
            "site_name": "SaaSGlobal Hub",
        },
    )


def send_signup_welcome_email(
    *,
    recipient: str,
    customer_name: str,
    dashboard_url: str,
):
    return send_platform_email(
        subject="Welcome to SaaSGlobal Hub",
        recipient_list=[recipient],
        template_name="emails/signup_welcome.html",
        context={
            "preview_text": "Your account has been created successfully.",
            "headline": "Welcome to SaaSGlobal Hub",
            "customer_name": customer_name,
            "dashboard_url": dashboard_url,
            "cta_label": "Open Dashboard",
            "site_name": "SaaSGlobal Hub",
        },
    )


def send_admin_order_paid_email(
    *,
    recipient: str,
    admin_name: str,
    customer_name: str,
    customer_email: str,
    product_name: str,
    order_reference: str,
    amount_paid: str,
    payment_provider: str,
    order_url: str,
):
    return send_platform_email(
        subject=f"Order paid: {order_reference}",
        recipient_list=[recipient],
        template_name="emails/admin_order_paid.html",
        context={
            "preview_text": f"{customer_name} completed payment for {product_name}.",
            "headline": "Customer Payment Successful",
            "admin_name": admin_name,
            "customer_name": customer_name,
            "customer_email": customer_email,
            "product_name": product_name,
            "order_reference": order_reference,
            "amount_paid": amount_paid,
            "payment_provider": payment_provider,
            "order_url": order_url,
            "cta_label": "Open Order",
            "site_name": "SaaSGlobal Hub",
        },
    )
