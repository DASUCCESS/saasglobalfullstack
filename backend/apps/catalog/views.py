from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from apps.catalog.models import Product
from apps.catalog.serializers import ProductSerializer
from apps.catalog.services import compress_image_to_target
from apps.core.models import CloudinarySettings
from apps.core.pagination import StandardResultsSetPagination
import cloudinary.uploader


@method_decorator(cache_page(60), name='list')
@method_decorator(cache_page(120), name='retrieve')
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.action in {'list', 'retrieve'}:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        if self.request.query_params.get('visible') == '1':
            queryset = queryset.filter(is_visible=True)
        return queryset


@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(60)
def products_page_payload(_request):
    products = Product.objects.filter(is_visible=True)
    serializer = ProductSerializer(products, many=True)
    return Response({'products': serializer.data})


class UploadProductImageView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        if "image" not in request.FILES:
            return Response({"detail": "image is required"}, status=400)
        settings = CloudinarySettings.load()
        if not (settings.cloud_name and settings.api_key and settings.api_secret):
            return Response({"detail": "Cloudinary credentials are not configured"}, status=400)

        cloudinary.config(cloud_name=settings.cloud_name, api_key=settings.api_key, api_secret=settings.api_secret)
        compressed = compress_image_to_target(request.FILES["image"], target_kb=50)
        uploaded = cloudinary.uploader.upload(compressed, folder=settings.folder or "products")
        return Response({"url": uploaded.get("secure_url", "")})
