from rest_framework import serializers
from apps.catalog.models import Product, ProductBenefit, ProductFAQ, ProductFeature, ProductKPI, ProductStep
from apps.core.models import PaymentSettings


class ProductFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFeature
        fields = ["id", "title", "description", "sort_order"]


class ProductStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductStep
        fields = ["id", "title", "description", "sort_order"]


class ProductBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductBenefit
        fields = ["id", "text", "sort_order"]


class ProductFAQSerializer(serializers.ModelSerializer):
    q = serializers.CharField(source="question")
    a = serializers.CharField(source="answer")

    class Meta:
        model = ProductFAQ
        fields = ["id", "q", "a", "sort_order"]


class ProductKPISerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductKPI
        fields = ["id", "key", "sub", "sort_order"]


class ProductPublicSerializer(serializers.ModelSerializer):
    price_ngn = serializers.SerializerMethodField()
    features = ProductFeatureSerializer(many=True, read_only=True)
    steps = ProductStepSerializer(many=True, read_only=True)
    benefits = ProductBenefitSerializer(many=True, read_only=True)
    faqs = ProductFAQSerializer(many=True, read_only=True)
    kpis = ProductKPISerializer(many=True, read_only=True)
    seo = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "badge",
            "tagline",
            "short_description",
            "image_url",
            "demo_url",
            "support_url",
            "support_email",
            "price_usd",
            "price_ngn",
            "status",
            "is_visible",
            "delivery_type",
            "content",
            "seo",
            "features",
            "steps",
            "benefits",
            "faqs",
            "kpis",
            "created_at",
            "updated_at",
        ]

    def get_price_ngn(self, obj):
        settings = PaymentSettings.load()
        return round(float(obj.price_usd) * float(settings.usd_ngn_rate), 2)

    def get_seo(self, obj):
        seo = obj.seo or {}
        return {
            "meta_title": seo.get("meta_title", ""),
            "meta_description": seo.get("meta_description", ""),
            "meta_keywords": seo.get("meta_keywords", ""),
            "canonical_url": seo.get("canonical_url", ""),
            "og_title": seo.get("og_title", ""),
            "og_description": seo.get("og_description", ""),
            "og_image": seo.get("og_image", ""),
        }


class ProductAdminSerializer(serializers.ModelSerializer):
    price_ngn = serializers.SerializerMethodField()
    features = ProductFeatureSerializer(many=True, read_only=True)
    steps = ProductStepSerializer(many=True, read_only=True)
    benefits = ProductBenefitSerializer(many=True, read_only=True)
    faqs = ProductFAQSerializer(many=True, read_only=True)
    kpis = ProductKPISerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = "__all__"

    def get_price_ngn(self, obj):
        settings = PaymentSettings.load()
        return round(float(obj.price_usd) * float(settings.usd_ngn_rate), 2)