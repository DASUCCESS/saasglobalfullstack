from rest_framework import serializers
from apps.catalog.models import Product, ProductFeature, ProductStep, ProductBenefit, ProductFAQ, ProductKPI
from apps.core.models import PaymentSettings


class ProductFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFeature
        fields = ['id', 'title', 'description', 'sort_order']


class ProductStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductStep
        fields = ['id', 'title', 'description', 'sort_order']


class ProductBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductBenefit
        fields = ['id', 'text', 'sort_order']


class ProductFAQSerializer(serializers.ModelSerializer):
    q = serializers.CharField(source='question')
    a = serializers.CharField(source='answer')

    class Meta:
        model = ProductFAQ
        fields = ['id', 'q', 'a', 'sort_order']


class ProductKPISerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductKPI
        fields = ['id', 'key', 'sub', 'sort_order']


class ProductSerializer(serializers.ModelSerializer):
    price_ngn = serializers.SerializerMethodField()
    features = ProductFeatureSerializer(many=True, read_only=True)
    steps = ProductStepSerializer(many=True, read_only=True)
    benefits = ProductBenefitSerializer(many=True, read_only=True)
    faqs = ProductFAQSerializer(many=True, read_only=True)
    kpis = ProductKPISerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_price_ngn(self, obj):
        settings = PaymentSettings.load()
        return round(float(obj.price_usd) * float(settings.usd_ngn_rate), 2)
