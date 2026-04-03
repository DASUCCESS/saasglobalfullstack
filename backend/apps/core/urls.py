from django.urls import path
from apps.core.views import public_settings, admin_settings, refresh_rate, update_admin_settings

urlpatterns = [
    path('settings/public/', public_settings),
    path('settings/admin/', admin_settings),
    path('settings/admin/update/', update_admin_settings),
    path('settings/payment/refresh-rate/', refresh_rate),
]
