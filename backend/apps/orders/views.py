from urllib.parse import quote
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.orders.serializers import RequestLeadSerializer
from apps.core.models import ContactSettings


def _build_message(data):
    return '\n'.join([
        "Hello SaaSGlobal Hub, I'd like to make a request / give feedback.",
        f"Name: {data.get('full_name', '-')}",
        f"Company: {data.get('company', '-')}",
        f"Email: {data.get('email', '-')}",
        f"Request Type: {data.get('request_type', '-')}",
        f"Urgency: {data.get('urgency', '-')}",
        f"Estimated Budget: {data.get('budget', '-')}",
        '',
        f"Details: {data.get('details', '-')}",
    ])


@api_view(['POST'])
def create_request(request):
    serializer = RequestLeadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    lead = serializer.save()
    settings = ContactSettings.load()
    message = _build_message(serializer.validated_data)

    if lead.channel == 'email' and settings.from_email and settings.smtp_username:
        send_mail(
            subject=f"New request: {lead.request_type}",
            message=message,
            from_email=settings.from_email,
            recipient_list=[settings.smtp_username],
            fail_silently=True,
        )

    whatsapp_url = ''
    if settings.whatsapp_number:
        whatsapp_url = f"https://wa.me/{settings.whatsapp_number}?text={quote(message)}"

    return Response({'id': lead.id, 'whatsapp_url': whatsapp_url})
