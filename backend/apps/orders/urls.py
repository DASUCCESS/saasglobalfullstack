from django.urls import path
from apps.orders.views import create_request

urlpatterns = [
    path('requests/', create_request),
]
