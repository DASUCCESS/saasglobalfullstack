from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from django.views.decorators.cache import cache_page
from apps.core.models import ContactSettings, CloudinarySettings, PaymentSettings, SiteSettings
from apps.core.serializers import (
    ContactSettingsSerializer,
    CloudinarySettingsSerializer,
    PaymentSettingsSerializer,
    SiteSettingsSerializer,
)
import requests


@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(120)
def public_settings(_request):
    return Response(
        {
            'contact': ContactSettingsSerializer(ContactSettings.load()).data,
            'payment': PaymentSettingsSerializer(PaymentSettings.load()).data,
            'site': SiteSettingsSerializer(SiteSettings.load()).data,
        }
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_rate(_request):
    try:
        response = requests.get('https://open.er-api.com/v6/latest/USD', timeout=8)
        response.raise_for_status()
        ngn = response.json().get('rates', {}).get('NGN')
        if ngn:
            s = PaymentSettings.load()
            s.usd_ngn_rate = ngn
            s.save()
            return Response({'usd_ngn_rate': ngn})
    except Exception:
        pass
    return Response({'detail': 'Could not refresh rate'}, status=400)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_settings(_request):
    return Response(
        {
            'contact': ContactSettingsSerializer(ContactSettings.load()).data,
            'cloudinary': CloudinarySettingsSerializer(CloudinarySettings.load()).data,
            'payment': PaymentSettingsSerializer(PaymentSettings.load()).data,
            'site': SiteSettingsSerializer(SiteSettings.load()).data,
        }
    )


@api_view(['PATCH', 'POST'])
@permission_classes([IsAdminUser])
def update_admin_settings(request):
    contact = ContactSettings.load()
    cloudinary = CloudinarySettings.load()
    payment = PaymentSettings.load()
    site = SiteSettings.load()

    if 'contact' in request.data:
        serializer = ContactSettingsSerializer(contact, data=request.data['contact'], partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    if 'cloudinary' in request.data:
        serializer = CloudinarySettingsSerializer(cloudinary, data=request.data['cloudinary'], partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    if 'payment' in request.data:
        serializer = PaymentSettingsSerializer(payment, data=request.data['payment'], partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    if 'site' in request.data:
        serializer = SiteSettingsSerializer(site, data=request.data['site'], partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    return admin_settings(request)
