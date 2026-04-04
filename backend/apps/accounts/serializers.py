from rest_framework import serializers
from apps.accounts.models import PurchaseOrder, ConversationMessage


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6)
    full_name = serializers.CharField(max_length=255)


class AdminRegisterSerializer(RegisterSerializer):
    access_pin = serializers.CharField(max_length=64)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class AdminLoginSerializer(LoginSerializer):
    access_pin = serializers.CharField(max_length=64)


class GoogleLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    google_id = serializers.CharField(max_length=255)


class PurchaseOrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    download_url = serializers.SerializerMethodField()
    download_details = serializers.SerializerMethodField()
    unread_admin_messages = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'product_name', 'product_slug', 'provider', 'amount', 'amount_ngn', 'status', 'payment_reference',
            'created_at', 'paid_at', 'download_url', 'download_details', 'unread_admin_messages',
        ]

    def get_download_url(self, obj):
        if obj.status == 'paid':
            return obj.product.downloadable_zip_url
        return ''

    def get_download_details(self, obj):
        if obj.status != 'paid' or not obj.product.downloadable_zip_url:
            return {}
        download_meta = (obj.product.content or {}).get('download', {})
        return {
            'version': download_meta.get('version', ''),
            'file_size': download_meta.get('file_size', ''),
            'checksum': download_meta.get('checksum', ''),
            'changelog': download_meta.get('changelog', ''),
            'released_at': download_meta.get('released_at', ''),
        }

    def get_unread_admin_messages(self, obj):
        return int(getattr(obj, 'unread_admin_messages', 0) or 0)


class ConversationMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)

    class Meta:
        model = ConversationMessage
        fields = ['id', 'message', 'is_admin', 'sender_name', 'created_at']


class AdminPurchaseOrderSerializer(PurchaseOrderSerializer):
    customer_email = serializers.EmailField(source='user.email', read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta(PurchaseOrderSerializer.Meta):
        fields = PurchaseOrderSerializer.Meta.fields + ['customer_email', 'customer_name']

    def get_customer_name(self, obj):
        return obj.user.get_full_name() or obj.user.first_name or obj.user.username
