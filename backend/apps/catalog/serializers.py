from rest_framework import serializers
from django.utils import timezone
from apps.catalog.models import Product, ProductBenefit, ProductFAQ, ProductFeature, ProductKPI, ProductStep
from apps.catalog.subscription_periods import SUPPORTED_SUBSCRIPTION_PLAN_IDS, resolve_subscription_interval
from apps.core.models import PaymentSettings


def _supports_subscription_billing_period(plan_id: str, billing_period: str) -> bool:
    return resolve_subscription_interval(plan_id, billing_period) is not None


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
    promotion_price_ngn = serializers.SerializerMethodField()
    current_price_usd = serializers.SerializerMethodField()
    current_price_ngn = serializers.SerializerMethodField()
    promotion_is_active = serializers.SerializerMethodField()
    subscription_plans = serializers.SerializerMethodField()
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
            "promotion_enabled",
            "promotion_price_usd",
            "promotion_price_ngn",
            "promotion_start_at",
            "promotion_end_at",
            "promotion_is_active",
            "current_price_usd",
            "current_price_ngn",
            "subscription_enabled",
            "subscription_plans",
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

    def _payment_settings(self):
        if not hasattr(self, "_cached_payment_settings"):
            self._cached_payment_settings = PaymentSettings.load()
        return self._cached_payment_settings

    def get_price_ngn(self, obj):
        settings = self._payment_settings()
        return round(float(obj.price_usd) * float(settings.usd_ngn_rate), 2)

    def get_promotion_price_ngn(self, obj):
        if obj.promotion_price_usd is None:
            return None
        settings = self._payment_settings()
        return round(float(obj.promotion_price_usd) * float(settings.usd_ngn_rate), 2)

    def get_current_price_usd(self, obj):
        return obj.current_price_usd(now=timezone.now())

    def get_current_price_ngn(self, obj):
        settings = self._payment_settings()
        return round(float(obj.current_price_usd(now=timezone.now())) * float(settings.usd_ngn_rate), 2)

    def get_promotion_is_active(self, obj):
        return obj.has_active_promotion(now=timezone.now())

    def get_subscription_plans(self, obj):
        settings = self._payment_settings()
        rate = float(settings.usd_ngn_rate)
        plans = []
        for plan in obj.normalized_subscription_plans():
            plans.append(
                {
                    **plan,
                    "price_ngn": round(float(plan["price_usd"]) * rate, 2),
                }
            )
        return plans

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

    def validate(self, attrs):
        promotion_enabled = attrs.get("promotion_enabled", getattr(self.instance, "promotion_enabled", False))
        promotion_price = attrs.get("promotion_price_usd", getattr(self.instance, "promotion_price_usd", None))
        promotion_start = attrs.get("promotion_start_at", getattr(self.instance, "promotion_start_at", None))
        promotion_end = attrs.get("promotion_end_at", getattr(self.instance, "promotion_end_at", None))
        price_usd = attrs.get("price_usd", getattr(self.instance, "price_usd", 0))

        if promotion_enabled:
            if promotion_price is None:
                raise serializers.ValidationError({"promotion_price_usd": "Promotion price is required when promotion is enabled."})
            if promotion_start is None or promotion_end is None:
                raise serializers.ValidationError({"promotion_end_at": "Promotion start and end dates are required when promotion is enabled."})
            if promotion_start >= promotion_end:
                raise serializers.ValidationError({"promotion_end_at": "Promotion end must be after the promotion start time."})
            if promotion_price >= price_usd:
                raise serializers.ValidationError({"promotion_price_usd": "Promotion price must be lower than the original price."})

        subscription_enabled = attrs.get("subscription_enabled", getattr(self.instance, "subscription_enabled", False))
        subscription_plans = attrs.get("subscription_plans", getattr(self.instance, "subscription_plans", []))
        if subscription_enabled:
            if not isinstance(subscription_plans, list) or not subscription_plans:
                raise serializers.ValidationError({"subscription_plans": "At least one subscription plan is required when subscription is enabled."})

            seen_ids = set()
            for idx, plan in enumerate(subscription_plans):
                if not isinstance(plan, dict):
                    raise serializers.ValidationError({"subscription_plans": f"Plan at index {idx} must be an object."})
                plan_id = str(plan.get("id", "")).strip()
                name = str(plan.get("name", "")).strip()
                billing_period = str(plan.get("billing_period", "")).strip()
                price_usd = plan.get("price_usd")

                if not (plan_id and name and billing_period):
                    raise serializers.ValidationError({"subscription_plans": f"Plan at index {idx} must include id, name, and billing_period."})
                normalized_plan_id = plan_id.lower()
                if normalized_plan_id in seen_ids:
                    raise serializers.ValidationError({"subscription_plans": f"Duplicate plan id '{plan_id}' is not allowed (case-insensitive)."})
                if normalized_plan_id not in SUPPORTED_SUBSCRIPTION_PLAN_IDS:
                    raise serializers.ValidationError(
                        {
                            "subscription_plans": (
                                f"Plan id '{plan_id}' is unsupported. "
                                f"Use: {', '.join(SUPPORTED_SUBSCRIPTION_PLAN_IDS.keys())}."
                            )
                        }
                    )
                if not _supports_subscription_billing_period(plan_id, billing_period):
                    raise serializers.ValidationError(
                        {
                            "subscription_plans": (
                                f"Plan '{plan_id}' billing_period '{billing_period}' is unsupported. "
                                f"Use plan ids: {', '.join(SUPPORTED_SUBSCRIPTION_PLAN_IDS.keys())}."
                            )
                        }
                    )
                seen_ids.add(normalized_plan_id)
                try:
                    if float(price_usd) <= 0:
                        raise serializers.ValidationError({"subscription_plans": f"Plan '{plan_id}' price must be greater than zero."})
                except (TypeError, ValueError):
                    raise serializers.ValidationError({"subscription_plans": f"Plan '{plan_id}' must include a valid numeric price_usd."})

            delivery_type = attrs.get("delivery_type", getattr(self.instance, "delivery_type", "none"))
            access_url = attrs.get("access_url", getattr(self.instance, "access_url", ""))
            if delivery_type == "download":
                raise serializers.ValidationError({"delivery_type": "Subscription products cannot use download-only fulfillment."})
            if delivery_type in {"access", "both"} and not (access_url or "").strip():
                raise serializers.ValidationError({"access_url": "Access URL is required when subscription is enabled for access/both fulfillment."})

        return attrs
