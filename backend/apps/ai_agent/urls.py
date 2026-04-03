from django.urls import path
from apps.ai_agent.views import ai_settings, ai_ask

urlpatterns = [
    path('ai/settings/', ai_settings),
    path('ai/ask/', ai_ask),
]
