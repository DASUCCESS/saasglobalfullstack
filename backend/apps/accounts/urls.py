from django.urls import path
from apps.accounts.views import (
    register,
    login,
    google_login,
    me,
    start_payment,
    verify_payment,
    dashboard,
    order_messages,
    admin_create_user,
)

urlpatterns = [
    path('auth/register/', register),
    path('auth/login/', login),
    path('auth/google/', google_login),
    path('auth/me/', me),
    path('auth/admin/register/', admin_create_user),
    path('payments/start/', start_payment),
    path('payments/verify/', verify_payment),
    path('dashboard/', dashboard),
    path('dashboard/orders/<int:order_id>/messages/', order_messages),
]
