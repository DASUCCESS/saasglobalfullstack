from django.db import models


class SingletonModel(models.Model):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class ContactSettings(SingletonModel):
    whatsapp_number = models.CharField(max_length=30, blank=True)
    smtp_host = models.CharField(max_length=255, blank=True)
    smtp_port = models.PositiveIntegerField(default=587)
    smtp_username = models.CharField(max_length=255, blank=True)
    smtp_password = models.CharField(max_length=255, blank=True)
    smtp_use_tls = models.BooleanField(default=True)
    from_email = models.EmailField(blank=True)


class CloudinarySettings(SingletonModel):
    cloud_name = models.CharField(max_length=255, blank=True)
    api_key = models.CharField(max_length=255, blank=True)
    api_secret = models.CharField(max_length=255, blank=True)
    folder = models.CharField(max_length=255, default='products')


class PaymentSettings(SingletonModel):
    stripe_public_key = models.CharField(max_length=255, blank=True)
    stripe_secret_key = models.CharField(max_length=255, blank=True)
    paystack_public_key = models.CharField(max_length=255, blank=True)
    paystack_secret_key = models.CharField(max_length=255, blank=True)
    usd_ngn_rate = models.DecimalField(max_digits=10, decimal_places=2, default=1500)


class SiteSettings(SingletonModel):
    site_name = models.CharField(max_length=255, default='SaaSGlobal Hub')
    ai_agent_label = models.CharField(max_length=255, default='Ask AI Agent')
    ai_agent_url = models.URLField(blank=True)
    google_client_id = models.CharField(max_length=255, blank=True)
    google_client_secret = models.CharField(max_length=255, blank=True)
    google_redirect_uri = models.URLField(blank=True)
    google_verified_domain = models.CharField(max_length=255, blank=True)
