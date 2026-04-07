from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.catalog.views import ProductViewSet, UploadProductImageView, products_page_payload

router = DefaultRouter()
router.register("products", ProductViewSet, basename="products")

urlpatterns = [
    path("products-page/", products_page_payload),
    path("products/upload-image/", UploadProductImageView.as_view()),
    path("", include(router.urls)),
]