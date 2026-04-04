from django.urls import path
from apps.accounts.views import (
    register,
    login,
    admin_login,
    google_login,
    me,
    start_payment,
    verify_payment,
    dashboard,
    dashboard_summary,
    admin_orders,
    order_messages,
    mark_order_messages_read,
    admin_create_user,
)

urlpatterns = [
    path('auth/register/', register),
    path('auth/login/', login),
    path('auth/admin/login/', admin_login),
    path('auth/google/', google_login),
    path('auth/me/', me),
    path('auth/admin/register/', admin_create_user),
    path('payments/start/', start_payment),
    path('payments/verify/', verify_payment),
    path('dashboard/', dashboard),
    path('dashboard/summary/', dashboard_summary),
    path('admin/orders/', admin_orders),
    path('dashboard/orders/<int:order_id>/messages/', order_messages),
    path('dashboard/orders/<int:order_id>/mark-read/', mark_order_messages_read),
]
