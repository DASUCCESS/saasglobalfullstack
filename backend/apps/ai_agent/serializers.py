from rest_framework import serializers
from apps.ai_agent.models import AIAgentSettings


class AIAgentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAgentSettings
        fields = '__all__'
