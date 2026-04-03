from rest_framework.routers import DefaultRouter
from django.urls import path, include
from apps.catalog.views import ProductViewSet, products_page_payload, UploadProductImageView

router = DefaultRouter()
router.register('products', ProductViewSet, basename='products')

urlpatterns = [
    path('products-page/', products_page_payload),
    path('products/upload-image/', UploadProductImageView.as_view()),
    path('', include(router.urls)),
]
