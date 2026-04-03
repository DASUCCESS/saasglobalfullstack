from django.contrib import admin
from apps.core.models import ContactSettings, CloudinarySettings, PaymentSettings, SiteSettings

admin.site.register(ContactSettings)
admin.site.register(CloudinarySettings)
admin.site.register(PaymentSettings)
admin.site.register(SiteSettings)
