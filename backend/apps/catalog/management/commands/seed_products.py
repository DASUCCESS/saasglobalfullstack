from django.core.management.base import BaseCommand
from apps.catalog.models import Product, ProductFeature, ProductStep, ProductBenefit, ProductFAQ, ProductKPI


PRODUCTS = [
    {
        'name': 'AI SaaS',
        'slug': 'ai-saas',
        'badge': 'AI SaaS',
        'tagline': 'WhatsApp + Web AI (Autosync)',
        'short_description': 'One AI brain across WhatsApp and Web with trainable RAG and workflow automation.',
        'content': {
            'hero_title': 'What You Need to Know About Our A.I SaaS',
            'hero_description': 'One AI brain across WhatsApp and Web. Train with your data, automate tasks, analyze behavior, and expose APIs to your clients.',
            'kpis': [
                {'key': 'Autosync', 'sub': 'WhatsApp + Web'},
                {'key': '1 Brain', 'sub': 'Shared context & memory'},
                {'key': 'RAG', 'sub': 'Grounded answers'},
                {'key': 'API', 'sub': 'Dedicated for you'},
            ],
            'features': [
                {'title': 'Live Chatbot API', 'description': 'Automated, trainable support on WhatsApp and Web.'},
                {'title': 'Task Automation', 'description': 'Streamline workflows and reduce response times.'},
                {'title': 'Data Analysis', 'description': 'Actionable insights into customer behavior and preferences.'},
                {'title': 'System Integration', 'description': 'APIs and webhooks into CRM/helpdesk/ERP stacks.'},
                {'title': 'Customizable Models', 'description': 'Train with files, images, text and URLs with policy controls.'},
                {'title': 'Autosync', 'description': 'Single AI memory shared across channels.'},
            ],
            'steps': [
                {'title': 'Ingest', 'description': 'Upload files, URLs and text to build a private knowledge base.'},
                {'title': 'Offer as API', 'description': 'Expose AI capabilities internally or to your clients.'},
                {'title': 'Operate & Scale', 'description': 'Automate interactions and monitor analytics.'},
            ],
            'benefits': [
                'Automated customer interactions',
                'Improved team efficiency',
                'Personalized engagement',
                'Multi-channel consistency',
                'Scalable operations',
            ],
            'faq': [
                {'q': 'Can we train with our own data?', 'a': 'Yes. Upload docs/images/text/URLs to ground responses.'},
                {'q': 'Can we expose it as API?', 'a': 'Yes. White-label API and webhooks are supported.'},
            ],
        },
        'price_usd': 199,
        'downloadable_zip_url': 'https://example.com/files/ai-saas.zip',
    },
    {
        'name': 'Logistics SaaS',
        'slug': 'logistics-saas',
        'badge': 'Last-Mile',
        'tagline': 'Last-mile routing, driver app, PoD',
        'short_description': 'Dispatch, routing, tracking, driver app, PoD, returns, and merchant onboarding.',
        'content': {
            'hero_title': 'What You Need to Know About Our Last-Mile Delivery SaaS Logistics Software',
            'hero_description': 'Streamline and monetize delivery operations with branch management and real-time tracking.',
            'features': [
                {'title': 'API Access', 'description': 'Integrate orders, events, and webhooks.'},
                {'title': 'Driver App', 'description': 'Navigation, PoD, barcode scanning, returns.'},
                {'title': 'Admin Dashboard', 'description': 'Dispatch board, SLAs, analytics and reporting.'},
                {'title': 'Company/Merchant Tools', 'description': 'Onboard companies, subscriptions and billing.'},
                {'title': 'Routing + Tracking', 'description': 'Route optimization and live courier tracking.'},
                {'title': 'Returns/RTO', 'description': 'Reverse logistics with audit trail.'},
            ],
            'steps': [
                {'title': 'Onboard', 'description': 'Create branches and assign supervisors.'},
                {'title': 'Dispatch', 'description': 'Auto assign drivers by proximity/capacity.'},
                {'title': 'Deliver', 'description': 'Complete delivery with proof and live status.'},
            ],
            'benefits': [
                'Revenue generation via third-party logistics',
                'Efficient branch management',
                'Real-time customer visibility',
                'Lower operational costs',
                'Scales across regions',
            ],
            'faq': [
                {'q': 'Does it support returns?', 'a': 'Yes, built-in RTO/returns workflows are included.'},
                {'q': 'Can third-party companies onboard?', 'a': 'Yes, with role and billing controls.'},
            ],
        },
        'price_usd': 249,
        'downloadable_zip_url': 'https://example.com/files/logistics-saas.zip',
    },
    {
        'name': 'Multi-supplier Platform',
        'slug': 'multi-supplier',
        'badge': 'Marketplace',
        'tagline': 'Admin-managed marketplace',
        'short_description': 'Supplier onboarding, unified checkout, auto-assigned riders, and settlements.',
        'content': {
            'hero_title': 'Multi-Supplier E-commerce & Logistics Platform',
            'hero_description': 'Admin-managed marketplace with supplier onboarding, logistics orchestration, and automated settlements.',
            'kpis': [
                {'key': '1 Checkout', 'sub': 'Across suppliers'},
                {'key': 'Auto', 'sub': 'Rider assignment'},
                {'key': 'D+0/7/14', 'sub': 'Payout cycles'},
                {'key': '99.9%', 'sub': 'Uptime target'},
            ],
            'features': [
                {'title': 'Admin Module', 'description': 'Supplier onboarding, catalog and orders control.'},
                {'title': 'Customer Experience', 'description': 'Unified cart and checkout across suppliers.'},
                {'title': 'Logistics Module', 'description': 'Auto-assigned riders and live GPS tracking.'},
                {'title': 'Settlement Engine', 'description': 'Commission deductions and payout cycles.'},
                {'title': 'Promotions', 'description': 'Featured listings and paid placements.'},
                {'title': 'Analytics', 'description': 'GMV, AOV, funnel and delivery KPIs.'},
            ],
            'steps': [
                {'title': 'Onboard Suppliers', 'description': 'Admin verifies and imports supplier catalog.'},
                {'title': 'Customers Shop', 'description': 'Users buy from multiple suppliers in one cart.'},
                {'title': 'Split + Route', 'description': 'Orders split and routed automatically.'},
                {'title': 'Settle', 'description': 'Suppliers paid by configured cycles.'},
            ],
            'benefits': [
                'Centralized supplier quality control',
                'Multiple monetization streams',
                'Convenient one-cart checkout',
                'Automated operations and scaling',
            ],
            'faq': [
                {'q': 'How are suppliers paid?', 'a': 'Automated scheduled settlements after commission.'},
                {'q': 'Can admin control supplier onboarding?', 'a': 'Yes, onboarding and verification are admin-managed.'},
            ],
        },
        'price_usd': 299,
        'downloadable_zip_url': 'https://example.com/files/multi-supplier.zip',
    },
    {
        'name': 'AI Detector Suite',
        'slug': 'ai-detector-suite',
        'badge': 'Upcoming',
        'tagline': 'Content authenticity & risk scoring',
        'short_description': 'Upcoming security and authenticity products.',
        'status': 'upcoming',
        'is_visible': True,
        'price_usd': 0,
    },
]


class Command(BaseCommand):
    help = 'Seed products shown on the current frontend into backend-managed Product entries.'

    def handle(self, *args, **options):
        for payload in PRODUCTS:
            content = payload.get('content', {})
            defaults = {**payload, 'content': content}
            product, _ = Product.objects.update_or_create(slug=payload['slug'], defaults=defaults)

            ProductKPI.objects.filter(product=product).delete()
            for i, item in enumerate(content.get('kpis', [])):
                ProductKPI.objects.create(product=product, key=item.get('key', ''), sub=item.get('sub', ''), sort_order=i)

            ProductFeature.objects.filter(product=product).delete()
            for i, item in enumerate(content.get('features', [])):
                ProductFeature.objects.create(product=product, title=item.get('title', ''), description=item.get('description', ''), sort_order=i)

            ProductStep.objects.filter(product=product).delete()
            for i, item in enumerate(content.get('steps', [])):
                ProductStep.objects.create(product=product, title=item.get('title', ''), description=item.get('description', ''), sort_order=i)

            ProductBenefit.objects.filter(product=product).delete()
            for i, text in enumerate(content.get('benefits', [])):
                ProductBenefit.objects.create(product=product, text=text, sort_order=i)

            ProductFAQ.objects.filter(product=product).delete()
            for i, item in enumerate(content.get('faq', [])):
                ProductFAQ.objects.create(product=product, question=item.get('q', ''), answer=item.get('a', ''), sort_order=i)

        self.stdout.write(self.style.SUCCESS('Seeded products with detail sections.'))
