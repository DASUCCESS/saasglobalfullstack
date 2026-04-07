from django.urls import path
from apps.accounts.views import (
    admin_access_pin_status,
    admin_access_pin_verify,
    admin_google_login,
    admin_google_register,
    admin_notifications_count,
    admin_notifications_list,
    admin_notifications_mark_read,
    admin_orders,
    admin_orders_summary,
    dashboard,
    dashboard_summary,
    google_login,
    mark_order_messages_read,
    me,
    notifications_count,
    notifications_list,
    notifications_mark_read,
    order_detail,
    order_messages,
    paystack_webhook,
    start_payment,
    stripe_webhook,
    update_admin_access_pin,
    verify_payment,
)

urlpatterns = [
    path("auth/google/", google_login),

    path("auth/admin/access-pin/status/", admin_access_pin_status),
    path("auth/admin/access-pin/verify/", admin_access_pin_verify),
    path("auth/admin/access-pin/update/", update_admin_access_pin),
    path("auth/admin/google/login/", admin_google_login),
    path("auth/admin/google/register/", admin_google_register),

    path("auth/me/", me),

    path("payments/start/", start_payment),
    path("payments/verify/", verify_payment),
    path("payments/webhooks/stripe/", stripe_webhook),
    path("payments/webhooks/paystack/", paystack_webhook),

    path("dashboard/", dashboard),
    path("dashboard/summary/", dashboard_summary),
    path("dashboard/orders/<int:order_id>/", order_detail),
    path("dashboard/orders/<int:order_id>/messages/", order_messages),
    path("dashboard/orders/<int:order_id>/mark-read/", mark_order_messages_read),

    path("notifications/", notifications_list),
    path("notifications/count/", notifications_count),
    path("notifications/mark-read/", notifications_mark_read),

    path("admin/orders/", admin_orders),
    path("admin/orders/summary/", admin_orders_summary),
    path("admin/notifications/", admin_notifications_list),
    path("admin/notifications/count/", admin_notifications_count),
    path("admin/notifications/mark-read/", admin_notifications_mark_read),
]
