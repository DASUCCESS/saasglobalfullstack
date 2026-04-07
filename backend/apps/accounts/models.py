from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone
from apps.catalog.models import Product


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("customer", "Customer"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="customer")
    google_sub = models.CharField(max_length=255, blank=True, db_index=True)
    avatar_url = models.URLField(blank=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)

    def touch(self):
        self.last_seen_at = timezone.now()
        self.save(update_fields=["last_seen_at"])

    @property
    def is_online(self) -> bool:
        if not self.last_seen_at:
            return False
        return (timezone.now() - self.last_seen_at).total_seconds() <= 300

    def __str__(self):
        return self.user.email or self.user.username


class PurchaseOrder(models.Model):
    PROVIDER_CHOICES = [
        ("stripe", "Stripe"),
        ("paystack", "Paystack"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    FULFILLMENT_TYPE_CHOICES = [
        ("none", "None"),
        ("download", "Download"),
        ("access", "Access"),
        ("both", "Both"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="orders")
    provider = models.CharField(max_length=20, choices=PROVIDER_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_ngn = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_reference = models.CharField(max_length=255, unique=True)
    idempotency_key = models.CharField(max_length=120, blank=True, null=True)

    provider_reference = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    provider_transaction_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    provider_checkout_url = models.TextField(blank=True, null=True)
    provider_status = models.CharField(max_length=120, blank=True)
    provider_payload = models.JSONField(default=dict, blank=True)
    webhook_verified = models.BooleanField(default=False)

    fulfillment_type = models.CharField(
        max_length=20,
        choices=FULFILLMENT_TYPE_CHOICES,
        default="none",
    )
    access_url = models.URLField(blank=True)
    access_label = models.CharField(max_length=255, blank=True)
    access_instructions = models.TextField(blank=True)
    delivery_payload = models.JSONField(default=dict, blank=True)

    paid_at = models.DateTimeField(null=True, blank=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True)

    user_last_read_at = models.DateTimeField(null=True, blank=True)
    user_last_read_message_id = models.BigIntegerField(null=True, blank=True)
    admin_last_read_at = models.DateTimeField(null=True, blank=True)
    admin_last_read_message_id = models.BigIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product", "provider", "idempotency_key"],
                condition=~Q(idempotency_key__isnull=True) & ~Q(idempotency_key=""),
                name="uniq_order_idempotency_per_user_product_provider",
            )
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return self.payment_reference

    @property
    def resolved_download_url(self) -> str:
        if self.status != "paid":
            return ""
        return self.delivery_payload.get("download_url") or self.product.downloadable_zip_url or ""

    @property
    def resolved_access_url(self) -> str:
        if self.status != "paid":
            return ""
        return self.access_url or self.product.access_url or ""

    @property
    def can_access_support_chat(self) -> bool:
        return self.status == "paid"


class PaymentEventLog(models.Model):
    EVENT_TYPE_CHOICES = [
        ("initialize", "Initialize"),
        ("verify", "Verify"),
        ("webhook", "Webhook"),
        ("status_change", "Status Change"),
        ("error", "Error"),
    ]

    order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="payment_events")
    provider = models.CharField(max_length=20)
    event_type = models.CharField(max_length=30, choices=EVENT_TYPE_CHOICES)
    status = models.CharField(max_length=120, blank=True)
    reference = models.CharField(max_length=255, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order.payment_reference} - {self.event_type}"


class ConversationMessage(models.Model):
    order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message #{self.pk} for {self.order.payment_reference}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ("order_paid", "Order Paid"),
        ("order_failed", "Order Failed"),
        ("new_message", "New Message"),
        ("admin_alert", "Admin Alert"),
        ("system", "System"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(max_length=40, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    link = models.CharField(max_length=500, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def mark_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=["is_read", "read_at"])

    def __str__(self):
        return f"{self.user_id} - {self.title}"