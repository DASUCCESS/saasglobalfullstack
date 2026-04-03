from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.core.urls')),
    path('api/', include('apps.catalog.urls')),
    path('api/', include('apps.orders.urls')),
    path('api/', include('apps.seo.urls')),
    path('api/', include('apps.ai_agent.urls')),
    path('api/', include('apps.accounts.urls')),
]
