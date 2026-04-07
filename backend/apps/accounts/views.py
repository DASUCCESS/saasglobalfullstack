import uuid

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Count, IntegerField, OuterRef, Q, Subquery, Sum, Value
from django.db.models.functions import Coalesce
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.models import ConversationMessage, Notification, PurchaseOrder, UserProfile
from apps.accounts.serializers import (
    AdminAccessPinVerifySerializer,
    AdminGoogleLoginSerializer,
    AdminGoogleRegisterSerializer,
    AdminPurchaseOrderSerializer,
    ConversationMessageSerializer,
    CreateConversationMessageSerializer,
    GoogleLoginSerializer,
    MarkReadSerializer,
    MeSerializer,
    NotificationMarkReadSerializer,
    NotificationSerializer,
    PaymentConfirmSerializer,
    PaymentStartSerializer,
    PurchaseOrderDetailSerializer,
    PurchaseOrderListSerializer,
    UpdateAdminAccessPinSerializer,
)
from apps.accounts.services.google_auth import verify_google_credential
from apps.accounts.services.payments import (
    PaymentError,
    confirm_payment,
    get_or_create_pending_order,
    initialize_payment,
    process_paystack_webhook,
    process_stripe_webhook,
)
from apps.accounts.throttles import (
    ChatMessageUserThrottle,
    GoogleLoginAnonThrottle,
    GoogleLoginUserThrottle,
    NotificationReadUserThrottle,
    PaymentStartUserThrottle,
    PaymentVerifyUserThrottle,
)
from apps.catalog.models import Product
from apps.core.models import SiteSettings
from apps.core.pagination import StandardResultsSetPagination


def _get_or_create_token(user):
    token, _ = Token.objects.get_or_create(user=user)
    return token.key


def _touch_user_activity(user):
    if not user or not user.is_authenticated:
        return
    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={"role": "admin" if user.is_staff else "customer"},
    )
    if profile.role != ("admin" if user.is_staff else "customer"):
        profile.role = "admin" if user.is_staff else "customer"
    profile.last_seen_at = timezone.now()
    profile.save(update_fields=["role", "last_seen_at"])


def _orders_with_unread_annotations(base_queryset):
    unread_admin_subquery = ConversationMessage.objects.filter(
        order_id=OuterRef("pk"),
        is_admin=True,
        id__gt=Coalesce(OuterRef("user_last_read_message_id"), Value(0)),
    ).values("order_id").annotate(c=Count("id")).values("c")[:1]

    unread_user_subquery = ConversationMessage.objects.filter(
        order_id=OuterRef("pk"),
        is_admin=False,
        id__gt=Coalesce(OuterRef("admin_last_read_message_id"), Value(0)),
    ).values("order_id").annotate(c=Count("id")).values("c")[:1]

    return base_queryset.annotate(
        unread_admin_messages=Coalesce(Subquery(unread_admin_subquery, output_field=IntegerField()), Value(0)),
        unread_user_messages=Coalesce(Subquery(unread_user_subquery, output_field=IntegerField()), Value(0)),
    )


def _sync_google_user(google_user, *, force_admin: bool):
    user, created = User.objects.get_or_create(
        username=google_user.email,
        defaults={
            "email": google_user.email,
            "first_name": google_user.full_name,
            "is_staff": force_admin,
        },
    )
    if created:
        user.set_unusable_password()
        user.save(update_fields=["password"])

    changed_fields = []
    if user.email != google_user.email:
        user.email = google_user.email
        changed_fields.append("email")
    if user.first_name != google_user.full_name:
        user.first_name = google_user.full_name
        changed_fields.append("first_name")
    if force_admin and not user.is_staff:
        user.is_staff = True
        changed_fields.append("is_staff")
    if changed_fields:
        user.save(update_fields=changed_fields)

    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={"role": "admin" if user.is_staff else "customer"},
    )
    profile.google_sub = google_user.sub
    profile.avatar_url = google_user.avatar_url
    profile.role = "admin" if force_admin or user.is_staff else "customer"
    profile.last_seen_at = timezone.now()
    profile.save(update_fields=["google_sub", "avatar_url", "role", "last_seen_at"])
    return user


@api_view(["GET"])
@permission_classes([AllowAny])
def admin_access_pin_status(_request):
    site = SiteSettings.load()
    return Response(
        {
            "configured": site.admin_access_pin_configured,
            "has_admin_users": User.objects.filter(is_staff=True).exists(),
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def admin_access_pin_verify(request):
    site = SiteSettings.load()
    if not site.admin_access_pin_configured:
        return Response({"detail": "Admin access PIN is not configured yet."}, status=400)

    serializer = AdminAccessPinVerifySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    if not site.check_admin_access_pin(serializer.validated_data["access_pin"]):
        return Response({"detail": "Invalid page access PIN."}, status=403)

    return Response({"status": "ok"})


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([GoogleLoginAnonThrottle, GoogleLoginUserThrottle])
def google_login(request):
    serializer = GoogleLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    google_user = verify_google_credential(data["credential"])
    existing = User.objects.filter(username=google_user.email).first()

    if existing and existing.is_staff:
        return Response({"detail": "This account is registered as an admin. Use the admin portal."}, status=403)

    user = _sync_google_user(google_user, force_admin=False)
    if user.is_staff:
        return Response({"detail": "This account is registered as an admin. Use the admin portal."}, status=403)

    profile, _ = UserProfile.objects.get_or_create(user=user)
    if profile.role != "customer":
        profile.role = "customer"
        profile.save(update_fields=["role"])

    return Response(
        {
            "token": _get_or_create_token(user),
            "user_id": user.id,
            "is_admin": False,
            "next_path": data.get("next_path", ""),
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([GoogleLoginAnonThrottle, GoogleLoginUserThrottle])
def admin_google_login(request):
    serializer = AdminGoogleLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    site = SiteSettings.load()
    if not site.admin_access_pin_configured:
        return Response({"detail": "Admin access PIN is not configured yet."}, status=400)

    if not site.check_admin_access_pin(data["access_pin"]):
        return Response({"detail": "Invalid page access PIN."}, status=403)

    google_user = verify_google_credential(data["credential"])
    user = User.objects.filter(username=google_user.email).first()
    if not user or not user.is_staff:
        return Response({"detail": "Admin account not found. Use admin registration if permitted."}, status=403)

    user = _sync_google_user(google_user, force_admin=True)
    return Response({"token": _get_or_create_token(user), "user_id": user.id, "is_admin": True})


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([GoogleLoginAnonThrottle, GoogleLoginUserThrottle])
def admin_google_register(request):
    serializer = AdminGoogleRegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    site = SiteSettings.load()
    has_admin_users = User.objects.filter(is_staff=True).exists()

    if site.admin_access_pin_configured:
        if not site.check_admin_access_pin(data.get("access_pin", "")):
            return Response({"detail": "Invalid page access PIN."}, status=403)
    else:
        if has_admin_users:
            return Response({"detail": "Admin access PIN is not configured. An existing admin must configure it first."}, status=400)
        setup_pin = (data.get("setup_pin") or "").strip()
        setup_pin_confirm = (data.get("setup_pin_confirm") or "").strip()
        if not setup_pin or not setup_pin_confirm:
            return Response({"detail": "Setup PIN and confirmation are required for first admin setup."}, status=400)
        if setup_pin != setup_pin_confirm:
            return Response({"detail": "Setup PIN confirmation does not match."}, status=400)
        site.set_admin_access_pin(setup_pin)
        site.save(update_fields=["admin_access_pin_hash"])

    google_user = verify_google_credential(data["credential"])
    user = _sync_google_user(google_user, force_admin=True)

    if not user.is_staff:
        user.is_staff = True
        user.save(update_fields=["is_staff"])

    profile, _ = UserProfile.objects.get_or_create(user=user)
    if profile.role != "admin":
        profile.role = "admin"
        profile.save(update_fields=["role"])

    return Response({"token": _get_or_create_token(user), "user_id": user.id, "is_admin": True})


@api_view(["POST"])
@permission_classes([IsAdminUser])
def update_admin_access_pin(request):
    serializer = UpdateAdminAccessPinSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    site = SiteSettings.load()
    if site.admin_access_pin_configured:
        if not site.check_admin_access_pin(data.get("current_pin", "")):
            return Response({"detail": "Current page access PIN is invalid."}, status=403)

    site.set_admin_access_pin(data["new_pin"])
    site.save(update_fields=["admin_access_pin_hash"])
    return Response({"status": "ok", "configured": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    _touch_user_activity(request.user)
    return Response(MeSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([PaymentStartUserThrottle])
def start_payment(request):
    _touch_user_activity(request.user)

    serializer = PaymentStartSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    product = Product.objects.filter(
        slug=data["product_slug"],
        is_visible=True,
    ).exclude(status="hidden").first()
    if not product:
        return Response({"detail": "Product not found."}, status=404)

    if product.status == "upcoming":
        return Response({"detail": "This product is not available for checkout yet."}, status=400)

    idempotency_key = (data.get("idempotency_key") or "").strip() or uuid.uuid4().hex

    try:
        order = get_or_create_pending_order(
            user=request.user,
            product=product,
            provider=data["provider"],
            idempotency_key=idempotency_key,
        )
        payload = initialize_payment(order)
    except PaymentError as exc:
        return Response({"detail": str(exc)}, status=400)
    except Exception as exc:
        return Response({"detail": f"Could not initialize payment: {str(exc)}"}, status=400)

    payload["idempotency_key"] = idempotency_key
    return Response(payload)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([PaymentVerifyUserThrottle])
def verify_payment(request):
    _touch_user_activity(request.user)

    serializer = PaymentConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    order = PurchaseOrder.objects.filter(
        payment_reference=data["payment_reference"],
        user=request.user,
    ).first()
    if not order:
        return Response({"detail": "Order not found."}, status=404)

    try:
        confirmed = confirm_payment(order, session_id=data.get("session_id", "").strip())
    except PaymentError as exc:
        return Response({"detail": str(exc)}, status=400)
    except Exception as exc:
        return Response({"detail": f"Could not verify payment: {str(exc)}"}, status=400)

    return Response(
        {
            "status": confirmed.status,
            "payment_reference": confirmed.payment_reference,
            "redirect_url": f"/dashboard/orders/{confirmed.id}",
            "order_id": confirmed.id,
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def stripe_webhook(request):
    signature = request.headers.get("Stripe-Signature", "")
    try:
        process_stripe_webhook(request.body, signature)
    except PaymentError as exc:
        return Response({"detail": str(exc)}, status=400)
    return HttpResponse(status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def paystack_webhook(request):
    signature = request.headers.get("X-Paystack-Signature", "")
    try:
        process_paystack_webhook(request.body, signature)
    except PaymentError as exc:
        return Response({"detail": str(exc)}, status=400)
    return HttpResponse(status=200)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard(request):
    _touch_user_activity(request.user)

    status_filter = request.query_params.get("status")
    search = (request.query_params.get("search") or "").strip()
    ordering = request.query_params.get("ordering") or "-created_at"
    allowed_ordering = {"-created_at", "created_at", "-amount", "amount"}

    if ordering not in allowed_ordering:
        ordering = "-created_at"

    orders = _orders_with_unread_annotations(
        PurchaseOrder.objects.filter(user=request.user).select_related("product")
    )

    if status_filter in {"pending", "paid", "failed"}:
        orders = orders.filter(status=status_filter)

    if search:
        orders = orders.filter(
            Q(product__name__icontains=search)
            | Q(payment_reference__icontains=search)
            | Q(provider__icontains=search)
        )

    orders = orders.order_by(ordering)

    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(orders, request)
    serialized = PurchaseOrderListSerializer(page, many=True).data
    return paginator.get_paginated_response(serialized)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    _touch_user_activity(request.user)

    base = PurchaseOrder.objects.filter(user=request.user)
    annotated = _orders_with_unread_annotations(base)

    return Response(
        {
            "total_orders": base.count(),
            "paid_orders": base.filter(status="paid").count(),
            "pending_orders": base.filter(status="pending").count(),
            "failed_orders": base.filter(status="failed").count(),
            "total_unread_admin_messages": annotated.aggregate(
                total=Coalesce(Sum("unread_admin_messages"), Value(0))
            )["total"] or 0,
            "unread_notifications": Notification.objects.filter(user=request.user, is_read=False).count(),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id: int):
    _touch_user_activity(request.user)

    order = _orders_with_unread_annotations(
        PurchaseOrder.objects.filter(id=order_id, user=request.user).select_related("product").prefetch_related("payment_events")
    ).first()
    if not order:
        return Response({"detail": "Order not found."}, status=404)
    return Response(PurchaseOrderDetailSerializer(order).data)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_orders(request):
    _touch_user_activity(request.user)

    status_filter = request.query_params.get("status")
    search = (request.query_params.get("search") or "").strip()
    ordering = request.query_params.get("ordering") or "-created_at"
    allowed_ordering = {"-created_at", "created_at", "-amount", "amount"}

    if ordering not in allowed_ordering:
        ordering = "-created_at"

    orders = _orders_with_unread_annotations(
        PurchaseOrder.objects.select_related("product", "user").prefetch_related("payment_events")
    )

    if status_filter in {"pending", "paid", "failed"}:
        orders = orders.filter(status=status_filter)

    if search:
        orders = orders.filter(
            Q(product__name__icontains=search)
            | Q(payment_reference__icontains=search)
            | Q(provider__icontains=search)
            | Q(user__email__icontains=search)
            | Q(user__first_name__icontains=search)
        )

    orders = orders.order_by(ordering)

    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(orders, request)
    serialized = AdminPurchaseOrderSerializer(page, many=True).data
    return paginator.get_paginated_response(serialized)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_orders_summary(request):
    _touch_user_activity(request.user)

    orders = PurchaseOrder.objects.all()
    unread_notifications = Notification.objects.filter(user=request.user, is_read=False).count()

    return Response(
        {
            "total_orders": orders.count(),
            "paid_orders": orders.filter(status="paid").count(),
            "pending_orders": orders.filter(status="pending").count(),
            "failed_orders": orders.filter(status="failed").count(),
            "unread_notifications": unread_notifications,
        }
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def order_messages(request, order_id: int):
    _touch_user_activity(request.user)

    order = PurchaseOrder.objects.filter(id=order_id).select_related("product", "user").first()
    if not order:
        return Response({"detail": "Order not found."}, status=404)

    is_owner = order.user_id == request.user.id
    is_admin = request.user.is_staff
    if not is_owner and not is_admin:
        return Response({"detail": "Forbidden."}, status=403)

    if request.method == "POST":
        if not order.can_access_support_chat:
            return Response({"detail": "Support chat opens after payment is confirmed."}, status=400)

        serializer = CreateConversationMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        msg = ConversationMessage.objects.create(
            order=order,
            sender=request.user,
            message=serializer.validated_data["message"].strip(),
            is_admin=request.user.is_staff,
        )
        return Response(ConversationMessageSerializer(msg).data)

    messages = order.messages.select_related("sender").order_by("created_at")
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(messages, request)

    annotated_order = _orders_with_unread_annotations(
        PurchaseOrder.objects.filter(id=order.id).select_related("product")
    ).first()

    payload = {
        "order": PurchaseOrderDetailSerializer(annotated_order).data,
        "messages": paginator.get_paginated_response(ConversationMessageSerializer(page, many=True).data).data,
    }
    return Response(payload)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([ChatMessageUserThrottle])
def mark_order_messages_read(request, order_id: int):
    _touch_user_activity(request.user)

    order = PurchaseOrder.objects.filter(id=order_id).first()
    if not order:
        return Response({"detail": "Order not found."}, status=404)

    if order.user_id != request.user.id and not request.user.is_staff:
        return Response({"detail": "Forbidden."}, status=403)

    serializer = MarkReadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    last_message_id = serializer.validated_data["last_message_id"]

    last_message = ConversationMessage.objects.filter(order_id=order.id, id=last_message_id).first()
    if not last_message:
        return Response({"detail": "Message not found for this order."}, status=404)

    now = timezone.now()
    if request.user.is_staff:
        order.admin_last_read_message_id = max(order.admin_last_read_message_id or 0, last_message.id)
        order.admin_last_read_at = now
        order.save(update_fields=["admin_last_read_message_id", "admin_last_read_at", "updated_at"])
        return Response({"status": "ok", "last_read_message_id": order.admin_last_read_message_id})

    order.user_last_read_message_id = max(order.user_last_read_message_id or 0, last_message.id)
    order.user_last_read_at = now
    order.save(update_fields=["user_last_read_message_id", "user_last_read_at", "updated_at"])
    return Response({"status": "ok", "last_read_message_id": order.user_last_read_message_id})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    _touch_user_activity(request.user)

    queryset = Notification.objects.filter(user=request.user)
    unread_only = request.query_params.get("unread")
    if unread_only == "1":
        queryset = queryset.filter(is_read=False)

    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(queryset, request)
    serialized = NotificationSerializer(page, many=True).data
    return paginator.get_paginated_response(serialized)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notifications_count(request):
    _touch_user_activity(request.user)
    unread = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({"unread": unread})


def _mark_notifications_read_for_user(user, payload):
    serializer = NotificationMarkReadSerializer(data=payload)
    serializer.is_valid(raise_exception=True)

    now = timezone.now()

    if serializer.validated_data.get("mark_all"):
        Notification.objects.filter(user=user, is_read=False).update(
            is_read=True,
            read_at=now,
        )
        return {"status": "ok"}

    ids = serializer.validated_data.get("notification_ids") or []
    if ids:
        Notification.objects.filter(
            user=user,
            id__in=ids,
            is_read=False,
        ).update(
            is_read=True,
            read_at=now,
        )

    return {"status": "ok"}

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([NotificationReadUserThrottle])
def notifications_mark_read(request):
    _touch_user_activity(request.user)
    return Response(_mark_notifications_read_for_user(request.user, request.data))

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_notifications_list(request):
    _touch_user_activity(request.user)

    queryset = Notification.objects.filter(user=request.user)
    unread_only = request.query_params.get("unread")
    if unread_only == "1":
        queryset = queryset.filter(is_read=False)

    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(queryset, request)
    serialized = NotificationSerializer(page, many=True).data
    return paginator.get_paginated_response(serialized)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_notifications_count(request):
    _touch_user_activity(request.user)
    unread = Notification.objects.filter(user=request.user, is_read=False).count()
    return Response({"unread": unread})


@api_view(["POST"])
@permission_classes([IsAdminUser])
@throttle_classes([NotificationReadUserThrottle])
def admin_notifications_mark_read(request):
    _touch_user_activity(request.user)
    return Response(_mark_notifications_read_for_user(request.user, request.data))