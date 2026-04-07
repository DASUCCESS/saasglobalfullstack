from django.contrib.auth.models import User
from rest_framework import serializers

from apps.accounts.models import ConversationMessage, Notification, PaymentEventLog, PurchaseOrder, UserProfile


class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField()
    next_path = serializers.CharField(required=False, allow_blank=True)


class AdminAccessPinStatusSerializer(serializers.Serializer):
    configured = serializers.BooleanField()
    has_admin_users = serializers.BooleanField()


class AdminAccessPinVerifySerializer(serializers.Serializer):
    access_pin = serializers.CharField(max_length=64)


class AdminGoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField()
    access_pin = serializers.CharField(max_length=64)


class AdminGoogleRegisterSerializer(serializers.Serializer):
    credential = serializers.CharField()
    access_pin = serializers.CharField(required=False, allow_blank=True)
    setup_pin = serializers.CharField(required=False, allow_blank=True, min_length=4, max_length=64)
    setup_pin_confirm = serializers.CharField(required=False, allow_blank=True, min_length=4, max_length=64)


class UpdateAdminAccessPinSerializer(serializers.Serializer):
    current_pin = serializers.CharField(required=False, allow_blank=True, max_length=64)
    new_pin = serializers.CharField(min_length=4, max_length=64)
    confirm_new_pin = serializers.CharField(min_length=4, max_length=64)

    def validate(self, attrs):
        if attrs["new_pin"] != attrs["confirm_new_pin"]:
            raise serializers.ValidationError({"confirm_new_pin": "PIN confirmation does not match."})
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["role", "google_sub", "avatar_url", "last_seen_at"]


class MeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "name", "is_staff", "profile"]

    def get_name(self, obj):
        return obj.get_full_name() or obj.first_name or obj.username


class PaymentStartSerializer(serializers.Serializer):
    product_slug = serializers.SlugField()
    provider = serializers.ChoiceField(choices=["stripe", "paystack"])
    idempotency_key = serializers.CharField(required=False, allow_blank=True)
    return_path = serializers.CharField(required=False, allow_blank=True)


class PaymentConfirmSerializer(serializers.Serializer):
    payment_reference = serializers.CharField()
    provider_reference = serializers.CharField(required=False, allow_blank=True)
    session_id = serializers.CharField(required=False, allow_blank=True)


class PaymentEventLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentEventLog
        fields = ["id", "provider", "event_type", "status", "reference", "payload", "note", "created_at"]


class PurchaseOrderListSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    unread_admin_messages = serializers.IntegerField(read_only=True, default=0)
    unread_user_messages = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "product_name",
            "product_slug",
            "provider",
            "amount",
            "amount_ngn",
            "status",
            "payment_reference",
            "created_at",
            "paid_at",
            "unread_admin_messages",
            "unread_user_messages",
        ]


class PurchaseOrderDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    product_image_url = serializers.CharField(source="product.image_url", read_only=True)
    unread_admin_messages = serializers.IntegerField(read_only=True, default=0)
    unread_user_messages = serializers.IntegerField(read_only=True, default=0)
    download_url = serializers.SerializerMethodField()
    access_url = serializers.SerializerMethodField()
    access_label = serializers.SerializerMethodField()
    access_instructions = serializers.SerializerMethodField()
    download_details = serializers.SerializerMethodField()
    can_access_support_chat = serializers.BooleanField(read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            "id",
            "product_name",
            "product_slug",
            "product_image_url",
            "provider",
            "amount",
            "amount_ngn",
            "status",
            "payment_reference",
            "provider_status",
            "created_at",
            "updated_at",
            "paid_at",
            "fulfilled_at",
            "download_url",
            "access_url",
            "access_label",
            "access_instructions",
            "download_details",
            "can_access_support_chat",
            "unread_admin_messages",
            "unread_user_messages",
        ]

    def get_download_url(self, obj):
        return obj.resolved_download_url

    def get_access_url(self, obj):
        return obj.resolved_access_url

    def get_access_label(self, obj):
        if obj.status != "paid":
            return ""
        return obj.access_label or obj.product.access_label or "Open Access"

    def get_access_instructions(self, obj):
        if obj.status != "paid":
            return ""
        return obj.access_instructions or obj.product.access_instructions or ""

    def get_download_details(self, obj):
        if obj.status != "paid":
            return {}
        download_meta = (obj.product.content or {}).get("download", {})
        return {
            "version": download_meta.get("version", ""),
            "file_size": download_meta.get("file_size", ""),
            "checksum": download_meta.get("checksum", ""),
            "changelog": download_meta.get("changelog", ""),
            "released_at": download_meta.get("released_at", ""),
        }


class AdminPurchaseOrderSerializer(PurchaseOrderDetailSerializer):
    customer_email = serializers.EmailField(source="user.email", read_only=True)
    customer_name = serializers.SerializerMethodField()
    payment_events = PaymentEventLogSerializer(many=True, read_only=True)

    class Meta(PurchaseOrderDetailSerializer.Meta):
        fields = PurchaseOrderDetailSerializer.Meta.fields + ["customer_email", "customer_name", "payment_events"]

    def get_customer_name(self, obj):
        return obj.user.get_full_name() or obj.user.first_name or obj.user.username


class ConversationMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.get_full_name", read_only=True)

    class Meta:
        model = ConversationMessage
        fields = ["id", "message", "is_admin", "sender_name", "created_at"]


class CreateConversationMessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=5000)


class MarkReadSerializer(serializers.Serializer):
    last_message_id = serializers.IntegerField(min_value=1)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "title",
            "body",
            "link",
            "metadata",
            "is_read",
            "read_at",
            "created_at",
        ]


class NotificationMarkReadSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        allow_empty=True,
    )
    mark_all = serializers.BooleanField(required=False, default=False)
