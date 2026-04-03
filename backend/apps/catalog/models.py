from django.db import models


class Product(models.Model):
    STATUS_CHOICES = [
        ('published', 'Published'),
        ('hidden', 'Hidden'),
        ('upcoming', 'Upcoming'),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    badge = models.CharField(max_length=255, blank=True)
    tagline = models.CharField(max_length=255)
    short_description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)
    downloadable_zip_url = models.URLField(blank=True)
    price_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published')
    is_visible = models.BooleanField(default=True)
    content = models.JSONField(default=dict, blank=True)
    seo = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.name


class ProductFeature(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='features')
    title = models.CharField(max_length=255)
    description = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']


class ProductStep(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='steps')
    title = models.CharField(max_length=255)
    description = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']


class ProductBenefit(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='benefits')
    text = models.CharField(max_length=500)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']


class ProductFAQ(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='faqs')
    question = models.CharField(max_length=500)
    answer = models.TextField()
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']


class ProductKPI(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='kpis')
    key = models.CharField(max_length=120)
    sub = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']
