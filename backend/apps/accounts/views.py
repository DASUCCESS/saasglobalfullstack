import os
import uuid
import hmac
import hashlib
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.mail import send_mail
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Count, IntegerField, OuterRef, Q, Subquery, Value, Sum
from django.db.models.functions import Coalesce
from apps.accounts.models import UserProfile, PurchaseOrder, ConversationMessage
from apps.accounts.serializers import (
    RegisterSerializer,
    LoginSerializer,
    AdminLoginSerializer,
    AdminRegisterSerializer,
    GoogleLoginSerializer,
    PurchaseOrderSerializer,
    AdminPurchaseOrderSerializer,
    ConversationMessageSerializer,
)
from apps.catalog.models import Product
from apps.core.models import PaymentSettings, ContactSettings
from apps.core.pagination import StandardResultsSetPagination


def _get_or_create_token(user):
    token, _ = Token.objects.get_or_create(user=user)
    return token.key


def _valid_admin_pin(raw_pin: str) -> bool:
    expected_pin = os.getenv('ADMIN_ACCESS_PIN', '')
    return bool(expected_pin) and raw_pin == expected_pin


def _valid_payment_signature(reference: str, status: str, signature: str) -> bool:
    secret = os.getenv('PAYMENT_WEBHOOK_SECRET', '').strip()
    if not secret:
        return False
    payload = f'{reference}:{status}'.encode('utf-8')
    expected = hmac.new(secret.encode('utf-8'), payload, hashlib.sha256).hexdigest()
    return bool(signature) and hmac.compare_digest(expected, signature)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    existing = User.objects.filter(username=data['email']).first()
    if existing:
        if existing.has_usable_password():
            return Response({'detail': 'User already exists. Please login.'}, status=409)
        existing.set_password(data['password'])
        existing.first_name = data['full_name']
        existing.email = data['email']
        existing.save(update_fields=['password', 'first_name', 'email'])
        UserProfile.objects.get_or_create(user=existing)
        return Response({'token': _get_or_create_token(existing), 'user_id': existing.id})

    user = User.objects.create_user(
        username=data['email'],
        email=data['email'],
        password=data['password'],
        first_name=data['full_name'],
    )
    UserProfile.objects.get_or_create(user=user)
    return Response({'token': _get_or_create_token(user), 'user_id': user.id})


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    user = authenticate(username=data['email'], password=data['password'])
    if not user:
        return Response({'detail': 'Invalid credentials'}, status=400)
    return Response({'token': _get_or_create_token(user), 'user_id': user.id, 'is_admin': user.is_staff})


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    serializer = AdminLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    if not _valid_admin_pin(data['access_pin']):
        return Response({'detail': 'Invalid admin access PIN'}, status=403)

    user = authenticate(username=data['email'], password=data['password'])
    if not user or not user.is_staff:
        return Response({'detail': 'Admin credentials required'}, status=403)

    return Response({'token': _get_or_create_token(user), 'user_id': user.id, 'is_admin': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    serializer = GoogleLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    user, created = User.objects.get_or_create(
        username=data['email'],
        defaults={'email': data['email'], 'first_name': data['full_name']},
    )
    if created:
        user.set_unusable_password()
        user.save()
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.google_id = data['google_id']
    profile.save()
    return Response({'token': _get_or_create_token(user), 'user_id': user.id})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({'id': request.user.id, 'email': request.user.email, 'name': request.user.get_full_name(), 'is_admin': request.user.is_staff})


@api_view(['POST'])
@permission_classes([AllowAny])
def start_payment(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '').strip()
    full_name = request.data.get('full_name', '').strip() or email
    product_slug = request.data.get('product_slug')
    provider = request.data.get('provider', 'stripe')
    google_id = request.data.get('google_id', '').strip()
    idempotency_key = (request.data.get('idempotency_key') or '').strip()

    if not email or not product_slug:
        return Response({'detail': 'email and product_slug are required'}, status=400)
    if not idempotency_key:
        return Response({'detail': 'idempotency_key is required'}, status=400)

    user = User.objects.filter(username=email).first()
    if not user:
        if google_id:
            user = User.objects.create_user(username=email, email=email, password=None, first_name=full_name)
            user.set_unusable_password()
            user.save()
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.google_id = google_id
            profile.save()
        elif password:
            user = User.objects.create_user(username=email, email=email, password=password, first_name=full_name)
            UserProfile.objects.get_or_create(user=user)
        else:
            return Response({'detail': 'Sign in with Google or provide password to create account before payment'}, status=400)

    product = Product.objects.filter(slug=product_slug).first()
    if not product:
        return Response({'detail': 'Product not found'}, status=404)

    existing_order = PurchaseOrder.objects.filter(
        user=user, product=product, provider=provider, idempotency_key=idempotency_key
    ).first()
    if existing_order:
        return Response({'order_id': existing_order.id, 'payment_reference': existing_order.payment_reference, 'token': _get_or_create_token(user)})

    pay_settings = PaymentSettings.load()
    with transaction.atomic():
        order = PurchaseOrder.objects.create(
            user=user,
            product=product,
            provider=provider,
            amount=product.price_usd,
            amount_ngn=float(product.price_usd) * float(pay_settings.usd_ngn_rate),
            payment_reference=f'ORD-{uuid.uuid4().hex[:12].upper()}',
            idempotency_key=idempotency_key or None,
        )
    token = _get_or_create_token(user)
    return Response({'order_id': order.id, 'payment_reference': order.payment_reference, 'token': token})


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_payment(request):
    ref = request.data.get('payment_reference')
    status = str(request.data.get('status', 'paid')).lower()
    signature = request.headers.get('X-Payment-Signature', '')
    if status not in {'paid', 'failed'}:
        return Response({'detail': 'status must be paid or failed'}, status=400)
    if not ref or not _valid_payment_signature(ref, status, signature):
        return Response({'detail': 'Invalid payment signature'}, status=403)

    order = PurchaseOrder.objects.filter(payment_reference=ref).first()
    if not order:
        return Response({'detail': 'Order not found'}, status=404)
    if order.status == 'paid':
        return Response({'status': order.status, 'redirect_url': '/dashboard'})
    if status == 'paid':
        order.status = 'paid'
        order.paid_at = timezone.now()
    else:
        order.status = 'failed'
    order.save()
    return Response({'status': order.status, 'redirect_url': '/dashboard'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    status_filter = request.query_params.get('status')
    search = (request.query_params.get('search') or '').strip()
    ordering = request.query_params.get('ordering') or '-created_at'
    allowed_ordering = {'-created_at', 'created_at', '-amount', 'amount'}
    if ordering not in allowed_ordering:
        ordering = '-created_at'

    unread_subquery = ConversationMessage.objects.filter(
        order_id=OuterRef('pk'),
        is_admin=True,
        id__gt=Coalesce(OuterRef('user_last_read_message_id'), Value(0)),
    ).values('order_id').annotate(c=Count('id')).values('c')[:1]

    orders = PurchaseOrder.objects.filter(user=request.user).select_related('product').annotate(
        unread_admin_messages=Coalesce(Subquery(unread_subquery, output_field=IntegerField()), Value(0))
    )
    if status_filter in {'pending', 'paid', 'failed'}:
        orders = orders.filter(status=status_filter)
    if search:
        orders = orders.filter(
            Q(product__name__icontains=search) | Q(payment_reference__icontains=search) | Q(provider__icontains=search)
        )
    orders = orders.order_by(ordering)
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(orders, request)
    serialized = PurchaseOrderSerializer(page, many=True).data
    return paginator.get_paginated_response(serialized)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    base = PurchaseOrder.objects.filter(user=request.user)
    unread_subquery = ConversationMessage.objects.filter(
        order_id=OuterRef('pk'),
        is_admin=True,
        id__gt=Coalesce(OuterRef('user_last_read_message_id'), Value(0)),
    ).values('order_id').annotate(c=Count('id')).values('c')[:1]
    annotated = base.annotate(unread_admin_messages=Coalesce(Subquery(unread_subquery, output_field=IntegerField()), Value(0)))
    return Response({
        'total_orders': base.count(),
        'paid_orders': base.filter(status='paid').count(),
        'pending_orders': base.filter(status='pending').count(),
        'failed_orders': base.filter(status='failed').count(),
        'total_unread_admin_messages': annotated.aggregate(total=Coalesce(Sum('unread_admin_messages'), Value(0)))['total'] or 0,
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_orders(request):
    unread_subquery = ConversationMessage.objects.filter(
        order_id=OuterRef('pk'),
        is_admin=True,
        id__gt=Coalesce(OuterRef('user_last_read_message_id'), Value(0)),
    ).values('order_id').annotate(c=Count('id')).values('c')[:1]
    orders = PurchaseOrder.objects.select_related('product', 'user').annotate(
        unread_admin_messages=Coalesce(Subquery(unread_subquery, output_field=IntegerField()), Value(0))
    ).order_by('-created_at')
    status_filter = request.query_params.get('status')
    if status_filter in {'pending', 'paid', 'failed'}:
        orders = orders.filter(status=status_filter)
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(orders, request)
    serialized = AdminPurchaseOrderSerializer(page, many=True).data
    return paginator.get_paginated_response(serialized)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def order_messages(request, order_id: int):
    order = PurchaseOrder.objects.filter(id=order_id).first()
    if not order:
        return Response({'detail': 'Order not found'}, status=404)
    if not request.user.is_staff and order.user_id != request.user.id:
        return Response({'detail': 'Forbidden'}, status=403)

    if request.method == 'POST':
        message = (request.data.get('message') or '').strip()
        if not message:
            return Response({'detail': 'Message is required'}, status=400)
        msg = ConversationMessage.objects.create(order=order, sender=request.user, message=message, is_admin=request.user.is_staff)

        if request.user.is_staff and order.messages.count() == 1:
            contact = ContactSettings.load()
            if contact.from_email and order.user.email:
                send_mail(
                    subject=f'New admin message for order {order.payment_reference}',
                    message=message,
                    from_email=contact.from_email,
                    recipient_list=[order.user.email],
                    fail_silently=True,
                )
        return Response(ConversationMessageSerializer(msg).data)

    messages = order.messages.select_related('sender').order_by('created_at')
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(messages, request)
    order_payload = PurchaseOrderSerializer(order).data
    paginated = paginator.get_paginated_response(ConversationMessageSerializer(page, many=True).data)
    return Response({'order': order_payload, 'messages': paginated.data})


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_create_user(request):
    serializer = AdminRegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    if not _valid_admin_pin(data['access_pin']):
        return Response({'detail': 'Invalid admin access PIN'}, status=403)

    user = User.objects.create_user(
        username=data['email'],
        email=data['email'],
        password=data['password'],
        first_name=data['full_name'],
        is_staff=True,
    )
    UserProfile.objects.get_or_create(user=user)
    return Response({'id': user.id, 'token': _get_or_create_token(user), 'is_admin': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_order_messages_read(request, order_id: int):
    order = PurchaseOrder.objects.filter(id=order_id).first()
    if not order:
        return Response({'detail': 'Order not found'}, status=404)
    if order.user_id != request.user.id and not request.user.is_staff:
        return Response({'detail': 'Forbidden'}, status=403)
    last_message_id = request.data.get('last_message_id')
    if not last_message_id:
        return Response({'detail': 'last_message_id is required'}, status=400)
    try:
        last_message_id = int(last_message_id)
    except (TypeError, ValueError):
        return Response({'detail': 'last_message_id must be an integer'}, status=400)

    with transaction.atomic():
        last_message = ConversationMessage.objects.filter(order_id=order.id, id=last_message_id).first()
        if not last_message:
            return Response({'detail': 'Message not found for this order'}, status=404)
        order.user_last_read_message_id = max(order.user_last_read_message_id or 0, last_message.id)
        order.user_last_read_at = timezone.now()
        order.save(update_fields=['user_last_read_message_id', 'user_last_read_at'])
    return Response({'status': 'ok', 'last_read_message_id': order.user_last_read_message_id})
