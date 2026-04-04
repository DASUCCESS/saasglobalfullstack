from django.conf import settings
from django.db import models
from django.db.models import Q
from apps.catalog.models import Product


class UserProfile(models.Model):
    ROLE_CHOICES = [('admin', 'Admin'), ('customer', 'Customer')]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    google_id = models.CharField(max_length=255, blank=True)


class PurchaseOrder(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    provider = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_ngn = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_reference = models.CharField(max_length=255, unique=True)
    idempotency_key = models.CharField(max_length=120, blank=True, null=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    user_last_read_at = models.DateTimeField(null=True, blank=True)
    user_last_read_message_id = models.BigIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'product', 'provider', 'idempotency_key'],
                condition=~Q(idempotency_key__isnull=True) & ~Q(idempotency_key=''),
                name='uniq_order_idempotency_per_user_product_provider',
            )
        ]


class ConversationMessage(models.Model):
    order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
