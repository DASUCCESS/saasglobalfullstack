import uuid
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.mail import send_mail
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from apps.accounts.models import UserProfile, PurchaseOrder, ConversationMessage
from apps.accounts.serializers import (
    RegisterSerializer,
    LoginSerializer,
    GoogleLoginSerializer,
    PurchaseOrderSerializer,
    ConversationMessageSerializer,
)
from apps.catalog.models import Product
from apps.core.models import PaymentSettings, ContactSettings


def _get_or_create_token(user):
    token, _ = Token.objects.get_or_create(user=user)
    return token.key


@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    user = User.objects.create_user(
        username=data['email'],
        email=data['email'],
        password=data['password'],
        first_name=data['full_name'],
    )
    UserProfile.objects.get_or_create(user=user)
    return Response({'token': _get_or_create_token(user), 'user_id': user.id})


@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    user = authenticate(username=data['email'], password=data['password'])
    if not user:
        return Response({'detail': 'Invalid credentials'}, status=400)
    return Response({'token': _get_or_create_token(user), 'user_id': user.id, 'is_admin': user.is_staff})


@api_view(['POST'])
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
def start_payment(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '').strip()
    full_name = request.data.get('full_name', '').strip() or email
    product_slug = request.data.get('product_slug')
    provider = request.data.get('provider', 'stripe')
    google_id = request.data.get('google_id', '').strip()

    if not email or not product_slug:
        return Response({'detail': 'email and product_slug are required'}, status=400)

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

    pay_settings = PaymentSettings.load()
    order = PurchaseOrder.objects.create(
        user=user,
        product=product,
        provider=provider,
        amount=product.price_usd,
        amount_ngn=float(product.price_usd) * float(pay_settings.usd_ngn_rate),
        payment_reference=f'ORD-{uuid.uuid4().hex[:12].upper()}',
    )
    token = _get_or_create_token(user)
    return Response({'order_id': order.id, 'payment_reference': order.payment_reference, 'token': token})


@api_view(['POST'])
def verify_payment(request):
    ref = request.data.get('payment_reference')
    success = bool(request.data.get('success', True))
    order = PurchaseOrder.objects.filter(payment_reference=ref).first()
    if not order:
        return Response({'detail': 'Order not found'}, status=404)
    if success:
        order.status = 'paid'
        order.paid_at = timezone.now()
    else:
        order.status = 'failed'
    order.save()
    return Response({'status': order.status, 'redirect_url': '/dashboard'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    orders = PurchaseOrder.objects.filter(user=request.user).select_related('product').order_by('-created_at')
    return Response({'orders': PurchaseOrderSerializer(orders, many=True).data})


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
    return Response({'messages': ConversationMessageSerializer(messages, many=True).data})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_create_user(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    user = User.objects.create_user(username=data['email'], email=data['email'], password=data['password'], first_name=data['full_name'])
    return Response({'id': user.id})
