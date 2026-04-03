from rest_framework import serializers
from apps.core.models import ContactSettings, CloudinarySettings, PaymentSettings, SiteSettings


class ContactSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSettings
        fields = '__all__'


class CloudinarySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CloudinarySettings
        fields = '__all__'


class PaymentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentSettings
        fields = '__all__'


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'
