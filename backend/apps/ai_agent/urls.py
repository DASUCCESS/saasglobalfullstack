from django.urls import path
from apps.ai_agent.views import ai_settings, ai_ask, update_ai_settings

urlpatterns = [
    path('ai/settings/', ai_settings),
    path('ai/settings/update/', update_ai_settings),
    path('ai/ask/', ai_ask),
]
