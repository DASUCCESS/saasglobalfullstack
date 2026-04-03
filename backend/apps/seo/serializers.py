from rest_framework import serializers
from apps.seo.models import PageSEO


class PageSEOSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageSEO
        fields = '__all__'
