from django.urls import path
from apps.seo.views import seo_by_page

urlpatterns = [
    path('seo/<slug:page_key>/', seo_by_page),
]
