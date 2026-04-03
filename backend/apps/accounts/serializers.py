from django.contrib.auth.models import User
from rest_framework import serializers
from apps.accounts.models import PurchaseOrder, ConversationMessage


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)
    full_name = serializers.CharField(max_length=255)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class GoogleLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    google_id = serializers.CharField(max_length=255)


class PurchaseOrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = ['id', 'product_name', 'provider', 'amount', 'amount_ngn', 'status', 'payment_reference', 'created_at', 'paid_at', 'download_url']

    def get_download_url(self, obj):
        if obj.status == 'paid':
            return obj.product.downloadable_zip_url
        return ''


class ConversationMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)

    class Meta:
        model = ConversationMessage
        fields = ['id', 'message', 'is_admin', 'sender_name', 'created_at']
