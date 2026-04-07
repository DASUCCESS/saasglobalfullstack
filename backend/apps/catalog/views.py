import cloudinary
import cloudinary.uploader
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Product
from apps.catalog.serializers import ProductAdminSerializer, ProductPublicSerializer
from apps.catalog.services import compress_image_to_target
from apps.core.models import CloudinarySettings
from apps.core.pagination import StandardResultsSetPagination


@method_decorator(cache_page(60), name="list")
@method_decorator(cache_page(120), name="retrieve")
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    lookup_field = "slug"
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return ProductAdminSerializer
        return ProductPublicSerializer

    def get_queryset(self):
        queryset = super().get_queryset().prefetch_related("features", "steps", "benefits", "faqs", "kpis")

        status = (self.request.query_params.get("status") or "").strip()
        search = (self.request.query_params.get("search") or "").strip()
        visible = self.request.query_params.get("visible")
        ordering = self.request.query_params.get("ordering") or "id"

        allowed_ordering = {"id", "-id", "name", "-name", "price_usd", "-price_usd", "created_at", "-created_at"}
        if ordering not in allowed_ordering:
            ordering = "id"

        if self.request.user.is_staff:
            if status in {"published", "hidden", "upcoming"}:
                queryset = queryset.filter(status=status)
            if visible in {"0", "1"}:
                queryset = queryset.filter(is_visible=(visible == "1"))
        else:
            queryset = queryset.filter(is_visible=True).exclude(status="hidden")
            if status in {"published", "upcoming"}:
                queryset = queryset.filter(status=status)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(tagline__icontains=search)
                | Q(short_description__icontains=search)
                | Q(slug__icontains=search)
            )

        return queryset.order_by(ordering)


@api_view(["GET"])
@permission_classes([AllowAny])
@cache_page(60)
def products_page_payload(_request):
    products = Product.objects.filter(is_visible=True).exclude(status="hidden").prefetch_related(
        "features", "steps", "benefits", "faqs", "kpis"
    )
    serializer = ProductPublicSerializer(products, many=True)
    return Response({"products": serializer.data})


class UploadProductImageView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser]

    def post(self, request):
        if "image" not in request.FILES:
            return Response({"detail": "image is required"}, status=400)

        settings = CloudinarySettings.load()
        if not (settings.cloud_name and settings.api_key and settings.api_secret):
            return Response({"detail": "Cloudinary credentials are not configured"}, status=400)

        cloudinary.config(
            cloud_name=settings.cloud_name,
            api_key=settings.api_key,
            api_secret=settings.api_secret,
        )

        compressed = compress_image_to_target(request.FILES["image"], target_kb=80)
        uploaded = cloudinary.uploader.upload(compressed, folder=settings.folder or "products")
        return Response({"url": uploaded.get("secure_url", "")})