from rest_framework import serializers
from apps.orders.models import RequestLead


class RequestLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestLead
        fields = '__all__'
