from django.db import models
from django.utils import timezone


class Product(models.Model):
    STATUS_CHOICES = [
        ("published", "Published"),
        ("hidden", "Hidden"),
        ("upcoming", "Upcoming"),
    ]

    DELIVERY_TYPE_CHOICES = [
        ("none", "None"),
        ("download", "Download"),
        ("access", "Access"),
        ("both", "Both"),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    badge = models.CharField(max_length=255, blank=True)
    tagline = models.CharField(max_length=255)
    short_description = models.TextField(blank=True)

    image_url = models.URLField(blank=True)
    downloadable_zip_url = models.URLField(blank=True)
    access_url = models.URLField(blank=True)
    access_label = models.CharField(max_length=255, blank=True)
    access_instructions = models.TextField(blank=True)
    demo_url = models.URLField(blank=True)
    support_url = models.URLField(blank=True)
    support_email = models.EmailField(blank=True)

    price_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    promotion_enabled = models.BooleanField(default=False)
    promotion_price_usd = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    promotion_start_at = models.DateTimeField(null=True, blank=True)
    promotion_end_at = models.DateTimeField(null=True, blank=True)
    subscription_enabled = models.BooleanField(default=False)
    subscription_plans = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="published")
    is_visible = models.BooleanField(default=True)
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPE_CHOICES, default="download")

    content = models.JSONField(default=dict, blank=True)
    seo = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name

    def has_active_promotion(self, now=None):
        if not self.promotion_enabled:
            return False
        if self.promotion_price_usd is None:
            return False
        if self.promotion_start_at is None or self.promotion_end_at is None:
            return False

        point_in_time = now or timezone.now()
        if self.promotion_start_at > point_in_time:
            return False
        if self.promotion_end_at <= point_in_time:
            return False
        if self.promotion_price_usd >= self.price_usd:
            return False
        return True

    def current_price_usd(self, now=None):
        if self.has_active_promotion(now=now):
            return self.promotion_price_usd
        return self.price_usd

    def normalized_subscription_plans(self):
        plans = self.subscription_plans or []
        normalized = []
        for plan in plans:
            if not isinstance(plan, dict):
                continue
            plan_id = str(plan.get("id", "")).strip()
            name = str(plan.get("name", "")).strip()
            billing_period = str(plan.get("billing_period", "")).strip()
            price_usd = plan.get("price_usd")
            if not (plan_id and name and billing_period):
                continue
            try:
                numeric_price = float(price_usd)
            except (TypeError, ValueError):
                continue
            if numeric_price <= 0:
                continue
            normalized.append(
                {
                    "id": plan_id,
                    "name": name,
                    "billing_period": billing_period,
                    "price_usd": round(numeric_price, 2),
                }
            )
        return normalized


class ProductFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="features")
    title = models.CharField(max_length=255)
    description = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]


class ProductStep(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="steps")
    title = models.CharField(max_length=255)
    description = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]


class ProductBenefit(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="benefits")
    text = models.CharField(max_length=500)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]


class ProductFAQ(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="faqs")
    question = models.CharField(max_length=500)
    answer = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]


class ProductKPI(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="kpis")
    key = models.CharField(max_length=120)
    sub = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]
