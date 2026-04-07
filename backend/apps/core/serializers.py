from rest_framework import serializers
from apps.core.models import ContactSettings, CloudinarySettings, PaymentSettings, SiteSettings


class PublicContactSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSettings
        fields = ["whatsapp_number"]


class AdminContactSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSettings
        fields = [
            "id",
            "whatsapp_number",
            "smtp_host",
            "smtp_port",
            "smtp_username",
            "smtp_password",
            "smtp_use_tls",
            "from_email",
        ]


class AdminCloudinarySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CloudinarySettings
        fields = ["id", "cloud_name", "api_key", "api_secret", "folder"]


class PublicPaymentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSettings
        fields = ["stripe_public_key", "paystack_public_key", "usd_ngn_rate"]


class AdminPaymentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSettings
        fields = [
            "id",
            "stripe_public_key",
            "stripe_secret_key",
            "stripe_webhook_secret",
            "paystack_public_key",
            "paystack_secret_key",
            "usd_ngn_rate",
        ]


class PublicSiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "site_name",
            "ai_agent_label",
            "ai_agent_url",
            "google_client_id",
            "google_verified_domain",
        ]


class AdminSiteSettingsSerializer(serializers.ModelSerializer):
    admin_access_pin_configured = serializers.SerializerMethodField(read_only=True)
    admin_access_pin = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = SiteSettings
        fields = [
            "id",
            "site_name",
            "ai_agent_label",
            "ai_agent_url",
            "google_client_id",
            "google_client_secret",
            "google_redirect_uri",
            "google_verified_domain",
            "admin_access_pin_configured",
            "admin_access_pin",
        ]

    def get_admin_access_pin_configured(self, obj):
        return obj.admin_access_pin_configured

    def update(self, instance, validated_data):
        raw_pin = validated_data.pop("admin_access_pin", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if raw_pin:
            instance.set_admin_access_pin(raw_pin)

        instance.save()
        return instance