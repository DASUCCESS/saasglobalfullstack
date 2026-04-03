from typing import Dict, List
import re
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.ai_agent.models import AIAgentSettings
from apps.ai_agent.serializers import AIAgentSettingsSerializer
from apps.catalog.models import Product
from apps.catalog.serializers import ProductSerializer


PRODUCT_KEYWORDS = {
    'product', 'price', 'pricing', 'cost', 'plan', 'feature', 'demo', 'buy', 'purchase',
    'ai saas', 'logistics', 'multi-supplier', 'ownmindai', 'marketplace', 'delivery'
}


def _tokenize(text: str) -> List[str]:
    return [x for x in re.findall(r'[a-z0-9-]+', text.lower()) if len(x) > 2]


def _is_product_question(question: str) -> bool:
    q = question.lower()
    if any(keyword in q for keyword in PRODUCT_KEYWORDS):
        return True
    product_names = Product.objects.filter(is_visible=True).values_list('name', flat=True)
    return any(name.lower() in q for name in product_names)


def _score_product(question_tokens: List[str], product: Dict) -> int:
    haystack = ' '.join([
        str(product.get('name', '')),
        str(product.get('slug', '')),
        str(product.get('tagline', '')),
        str(product.get('short_description', '')),
        ' '.join([f.get('title', '') for f in product.get('features', [])]),
    ]).lower()
    return sum(3 if token in product.get('name', '').lower() else 1 for token in question_tokens if token in haystack)


def _compact_context(products: List[Dict]) -> str:
    rows = []
    for p in products:
        rows.append(
            f"{p.get('name')} | {p.get('tagline')} | USD {p.get('price_usd')} | NGN {p.get('price_ngn')} | {p.get('short_description')}"
        )
    return '\n'.join(rows)


def _call_groq(settings: AIAgentSettings, user_question: str, extra_context: str = '') -> str:
    if not settings.groq_api_key:
        return ''

    payload = {
        'model': settings.model_name,
        'messages': [
            {'role': 'system', 'content': settings.system_prompt or 'You are a professional SaaSGlobal Hub assistant.'},
            {'role': 'system', 'content': f"Training context:\n{settings.training_text or 'No additional training text provided.'}"},
            {'role': 'system', 'content': f"Live product context (trimmed):\n{extra_context}" if extra_context else 'No product context included.'},
            {'role': 'user', 'content': user_question},
        ],
        'temperature': 0.2,
    }
    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={'Authorization': f'Bearer {settings.groq_api_key}', 'Content-Type': 'application/json'},
            json=payload,
            timeout=20,
        )
        response.raise_for_status()
        data = response.json()
        return data.get('choices', [{}])[0].get('message', {}).get('content', '').strip()
    except Exception:
        return ''


def _build_product_answer(question: str, settings: AIAgentSettings) -> Dict:
    all_products = ProductSerializer(Product.objects.filter(is_visible=True), many=True).data
    tokens = _tokenize(question)

    ranked = sorted(all_products, key=lambda p: _score_product(tokens, p), reverse=True)
    top_k = 6
    selected = [p for p in ranked[:top_k] if _score_product(tokens, p) > 0] or ranked[:4]

    context = _compact_context(selected)
    groq_answer = _call_groq(settings, question, extra_context=context)

    intro = "I'm currently pulling the latest product updates from our live database. Please hold on briefly..."

    if groq_answer:
        answer = f"{intro}\n\n{groq_answer}"
    else:
        bullets = []
        for p in selected[:3]:
            feature_text = '; '.join([f.get('title', '') for f in p.get('features', [])[:3]])
            bullets.append(
                f"- {p.get('name')} ({p.get('tagline')}) — USD ${p.get('price_usd')} / NGN ₦{p.get('price_ngn')}. {feature_text}"
            )
        answer = f"{intro}\n\nHere are the best matching products:\n" + '\n'.join(bullets)

    cards = [
        {
            'slug': p.get('slug'),
            'title': p.get('name'),
            'tagline': p.get('tagline'),
            'price_usd': p.get('price_usd'),
            'price_ngn': p.get('price_ngn'),
            'image_url': p.get('image_url'),
            'short_description': p.get('short_description'),
        }
        for p in selected
    ]

    frontend_code = "\n".join([
        "// Generated dynamic product detail page snippet (Next.js)",
        "import { apiGet } from '@/lib/api';",
        "export default async function ProductPage({ params }) {",
        "  const product = await apiGet(`/products/${params.slug}/`);",
        "  return <pre>{JSON.stringify(product, null, 2)}</pre>;",
        "}",
    ])

    return {
        'mode': 'product',
        'status': 'Latest product information fetched.',
        'answer': answer,
        'products_context': selected,
        'cards': cards,
        'frontend_page_code': frontend_code,
    }


@api_view(['GET'])
def ai_settings(_request):
    obj, _ = AIAgentSettings.objects.get_or_create(pk=1)
    return Response(AIAgentSettingsSerializer(obj).data)


@api_view(['POST'])
def ai_ask(request):
    question = (request.data.get('question') or '').strip()
    settings, _ = AIAgentSettings.objects.get_or_create(pk=1)

    if not question:
        return Response({'detail': 'question is required'}, status=400)

    if settings.include_products_context and _is_product_question(question):
        result = _build_product_answer(question, settings)
        result['question'] = question
        return Response(result)

    preamble = "I'm reviewing our latest company guidance from trained data. One moment while I prepare your response..."
    groq_answer = _call_groq(settings, question)
    trained_fallback = settings.training_text[:1200] if settings.training_text else 'No training data configured yet.'

    return Response(
        {
            'mode': 'general',
            'question': question,
            'status': 'Company response generated from trainable knowledge base.',
            'answer': f"{preamble}\n\n{groq_answer or trained_fallback}",
            'products_context': [],
            'cards': [],
        }
    )
