from urllib.parse import quote

from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django.contrib.auth import get_user_model

from apps.accounts.services.emails import send_platform_email
from apps.core.models import ContactSettings, SiteSettings
from apps.orders.serializers import RequestLeadSerializer


class RequestLeadAnonThrottle(AnonRateThrottle):
    rate = "10/hour"


class RequestLeadUserThrottle(UserRateThrottle):
    rate = "30/hour"


def _build_message(data):
    return "\n".join(
        [
            "Hello SaaSGlobal Hub, I'd like to make a request / give feedback.",
            f"Name: {data.get('full_name', '-')}",
            f"Company: {data.get('company', '-')}",
            f"Email: {data.get('email', '-')}",
            f"Request Type: {data.get('request_type', '-')}",
            f"Urgency: {data.get('urgency', '-')}",
            f"Estimated Budget: {data.get('budget', '-')}",
            "",
            f"Details: {data.get('details', '-')}",
        ]
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([RequestLeadAnonThrottle, RequestLeadUserThrottle])
def create_request(request):
    serializer = RequestLeadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    lead = serializer.save()

    contact_settings = ContactSettings.load()
    site_settings = SiteSettings.load()

    subject = f"New request: {lead.request_type}"
    headline = "New Request Submitted"
    preview_text = f"{lead.full_name} submitted a {lead.request_type.lower()} request."
    message = _build_message(serializer.validated_data)

    email_sent = False
    email_error = ""

    if lead.channel == "email":
        try:
            User = get_user_model()
            admin_recipients = list(
                User.objects.filter(is_staff=True, is_active=True)
                .exclude(email="")
                .values_list("email", flat=True)
            )
            if admin_recipients:
                email_sent = send_platform_email(
                    subject=subject,
                    recipient_list=admin_recipients,
                    template_name="emails/request_lead.html",
                    context={
                        "site_name": site_settings.site_name or "SaaSGlobal Hub",
                        "headline": headline,
                        "preview_text": preview_text,
                        "subject": subject,
                        "message": message,
                        "lead": lead,
                        "full_name": lead.full_name,
                        "company": lead.company,
                        "email": lead.email,
                        "request_type": lead.request_type,
                        "details": lead.details,
                        "budget": lead.budget,
                        "urgency": lead.urgency,
                        "channel": lead.channel,
                    },
                )
            else:
                email_error = "No active admin recipient email is configured."
        except Exception as exc:
            email_error = str(exc)

    whatsapp_url = ""
    if contact_settings.whatsapp_number:
        whatsapp_url = f"https://wa.me/{contact_settings.whatsapp_number}?text={quote(message)}"

    return Response(
        {
            "id": lead.id,
            "whatsapp_url": whatsapp_url,
            "email_sent": email_sent,
            "email_error": email_error,
        }
    )
