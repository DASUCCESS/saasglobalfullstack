import requests
from django.views.decorators.cache import cache_page
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from apps.core.models import ContactSettings, CloudinarySettings, PaymentSettings, SiteSettings
from apps.core.serializers import (
    AdminCloudinarySettingsSerializer,
    AdminContactSettingsSerializer,
    AdminPaymentSettingsSerializer,
    AdminSiteSettingsSerializer,
    PublicContactSettingsSerializer,
    PublicPaymentSettingsSerializer,
    PublicSiteSettingsSerializer,
)


def build_public_settings_payload():
    return {
        "contact": PublicContactSettingsSerializer(ContactSettings.load()).data,
        "payment": PublicPaymentSettingsSerializer(PaymentSettings.load()).data,
        "site": PublicSiteSettingsSerializer(SiteSettings.load()).data,
    }


def build_admin_settings_payload():
    return {
        "contact": AdminContactSettingsSerializer(ContactSettings.load()).data,
        "cloudinary": AdminCloudinarySettingsSerializer(CloudinarySettings.load()).data,
        "payment": AdminPaymentSettingsSerializer(PaymentSettings.load()).data,
        "site": AdminSiteSettingsSerializer(SiteSettings.load()).data,
    }


@api_view(["GET"])
@permission_classes([AllowAny])
@cache_page(120)
def public_settings(request):
    return Response(build_public_settings_payload())


@api_view(["POST"])
@permission_classes([IsAdminUser])
def refresh_rate(request):
    try:
        response = requests.get("https://open.er-api.com/v6/latest/USD", timeout=8)
        response.raise_for_status()
        ngn = response.json().get("rates", {}).get("NGN")

        if ngn:
            payment = PaymentSettings.load()
            payment.usd_ngn_rate = ngn
            payment.save()
            return Response({"usd_ngn_rate": ngn})
    except Exception:
        pass

    return Response({"detail": "Could not refresh rate"}, status=400)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_settings(request):
    return Response(build_admin_settings_payload())


@api_view(["PATCH", "POST"])
@permission_classes([IsAdminUser])
def update_admin_settings(request):
    contact = ContactSettings.load()
    cloudinary = CloudinarySettings.load()
    payment = PaymentSettings.load()
    site = SiteSettings.load()

    if "contact" in request.data:
        serializer = AdminContactSettingsSerializer(contact, data=request.data["contact"], partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    if "cloudinary" in request.data:
        serializer = AdminCloudinarySettingsSerializer(cloudinary, data=request.data["cloudinary"], partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    if "payment" in request.data:
        serializer = AdminPaymentSettingsSerializer(payment, data=request.data["payment"], partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    if "site" in request.data:
        site_payload = dict(request.data["site"])
        raw_admin_pin = site_payload.pop("admin_access_pin", None)

        serializer = AdminSiteSettingsSerializer(site, data=site_payload, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_site = serializer.save()

        if raw_admin_pin:
            updated_site.set_admin_access_pin(raw_admin_pin)
            updated_site.save(update_fields=["admin_access_pin_hash"])

    return Response(build_admin_settings_payload())