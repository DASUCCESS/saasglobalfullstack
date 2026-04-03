from django.contrib import admin
from apps.catalog.models import Product, ProductFeature, ProductStep, ProductBenefit, ProductFAQ, ProductKPI


class ProductFeatureInline(admin.TabularInline):
    model = ProductFeature
    extra = 1


class ProductStepInline(admin.TabularInline):
    model = ProductStep
    extra = 1


class ProductBenefitInline(admin.TabularInline):
    model = ProductBenefit
    extra = 1


class ProductFAQInline(admin.TabularInline):
    model = ProductFAQ
    extra = 1


class ProductKPIInline(admin.TabularInline):
    model = ProductKPI
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'status', 'is_visible', 'price_usd')
    list_filter = ('status', 'is_visible')
    search_fields = ('name', 'slug', 'tagline')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductKPIInline, ProductFeatureInline, ProductStepInline, ProductBenefitInline, ProductFAQInline]
