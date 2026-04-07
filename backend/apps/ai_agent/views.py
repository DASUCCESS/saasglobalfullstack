from typing import Dict, List, Optional, Tuple
import re
import requests

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from apps.ai_agent.models import AIAgentSettings
from apps.ai_agent.serializers import AIAgentSettingsSerializer
from apps.catalog.models import Product
from apps.catalog.serializers import ProductPublicSerializer


GENERAL_PRODUCT_KEYWORDS = {
    "product",
    "products",
    "price",
    "pricing",
    "cost",
    "costs",
    "buy",
    "purchase",
}

DETAIL_INTENT_KEYWORDS = {
    "how",
    "works",
    "work",
    "what",
    "about",
    "tell",
    "explain",
    "details",
    "detail",
    "use",
    "used",
    "usage",
    "who",
    "for",
    "benefit",
    "benefits",
    "compare",
    "difference",
    "best",
}

BROAD_DISCOVERY_PHRASES = {
    "tell me about",
    "show me",
    "what products",
    "what softwares",
    "what software",
    "what do you offer",
    "what do you have",
    "saas products",
    "products available",
    "available products",
}

FOLLOW_UP_PRODUCT_PATTERNS = {
    "it",
    "this",
    "that",
    "this one",
    "that one",
    "this product",
    "that product",
    "the product",
    "tell me more",
    "tell me more about it",
    "more about it",
    "explain more",
    "how does it work",
    "how it works",
    "how much is it",
    "how much",
    "can i buy it",
    "does it have",
    "is it available",
    "who is it for",
    "what does it do",
    "can it",
    "does it",
    "is it",
}


def _tokenize(text: str) -> List[str]:
    return [x for x in re.findall(r"[a-z0-9-]+", text.lower()) if len(x) > 2]


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip().lower())


def _visible_products_queryset():
    return Product.objects.filter(is_visible=True).exclude(status="hidden")


def _concise_instruction() -> str:
    return (
        "Keep answers short and concise. "
        "Use about 2 to 5 sentences in most cases. "
        "Answer the user directly first, then guide them to the most relevant next step. "
        "Do not produce unnecessarily long explanations unless the user explicitly asks for deep detail."
    )


def _get_product_by_slug(products: List[Dict], slug: str) -> Optional[Dict]:
    if not slug:
        return None
    for product in products:
        if product.get("slug") == slug:
            return product
    return None


def _is_product_question(question: str) -> bool:
    q = _normalize_text(question)

    if any(keyword in q for keyword in GENERAL_PRODUCT_KEYWORDS):
        return True

    product_names = _visible_products_queryset().values_list("name", flat=True)
    product_slugs = _visible_products_queryset().values_list("slug", flat=True)

    if any((name or "").lower() in q for name in product_names):
        return True

    if any((slug or "").lower() in q for slug in product_slugs):
        return True

    return False


def _question_refers_to_previous_product(question: str) -> bool:
    q = _normalize_text(question)
    tokens = _tokenize(q)

    if q in FOLLOW_UP_PRODUCT_PATTERNS:
        return True

    if any(pattern in q for pattern in FOLLOW_UP_PRODUCT_PATTERNS):
        return True

    if len(tokens) <= 8 and any(token in {"it", "this", "that"} for token in q.split()):
        return True

    return False


def _product_alias_tokens(product: Dict) -> List[str]:
    fields = [
        str(product.get("name", "")),
        str(product.get("slug", "")),
        str(product.get("badge", "")),
        str(product.get("tagline", "")),
        str(product.get("short_description", "")),
    ]
    tokens: List[str] = []
    for field in fields:
        tokens.extend(_tokenize(field))
    return list(dict.fromkeys(tokens))


def _score_product(question: str, question_tokens: List[str], product: Dict) -> int:
    q = _normalize_text(question)
    name = str(product.get("name", "")).lower()
    slug = str(product.get("slug", "")).lower()
    tagline = str(product.get("tagline", "")).lower()
    short_description = str(product.get("short_description", "")).lower()
    feature_titles = " ".join([f.get("title", "") for f in product.get("features", [])]).lower()
    step_titles = " ".join([s.get("title", "") for s in product.get("steps", [])]).lower()

    haystack = " ".join([name, slug, tagline, short_description, feature_titles, step_titles])

    score = 0

    if name and name in q:
        score += 18
    if slug and slug in q:
        score += 14
    if tagline and tagline in q:
        score += 8

    alias_tokens = _product_alias_tokens(product)
    for token in question_tokens:
        if token in name:
            score += 5
        elif token in slug:
            score += 4
        elif token in alias_tokens:
            score += 3
        elif token in haystack:
            score += 1

    phrase_patterns = [
        f"about {name}" if name else "",
        f"how {name} works" if name else "",
        f"tell me about {name}" if name else "",
        f"what is {name}" if name else "",
    ]
    for phrase in phrase_patterns:
        if phrase and phrase in q:
            score += 10

    return score


def _rank_products(question: str, products: List[Dict]) -> List[Tuple[int, Dict]]:
    tokens = _tokenize(question)
    scored = [(_score_product(question, tokens, product), product) for product in products]
    return sorted(scored, key=lambda item: item[0], reverse=True)


def _question_requests_detail(question: str) -> bool:
    q = _normalize_text(question)
    return any(keyword in q for keyword in DETAIL_INTENT_KEYWORDS)


def _question_is_broad_discovery(question: str) -> bool:
    q = _normalize_text(question)
    if any(phrase in q for phrase in BROAD_DISCOVERY_PHRASES):
        return True
    return "products" in q or "softwares" in q or "software" in q


def _compact_product_rows(products: List[Dict]) -> str:
    rows = []
    for p in products:
        feature_titles = ", ".join([f.get("title", "") for f in p.get("features", [])[:4] if f.get("title")])
        rows.append(
            "\n".join(
                [
                    f"Product: {p.get('name', '')}",
                    f"Slug: {p.get('slug', '')}",
                    f"Tagline: {p.get('tagline', '')}",
                    f"Short description: {p.get('short_description', '')}",
                    f"Price USD: {p.get('price_usd', '')}",
                    f"Price NGN: {p.get('price_ngn', '')}",
                    f"Delivery type: {p.get('delivery_type', '')}",
                    f"Demo URL: {p.get('demo_url', '')}",
                    f"Support URL: {p.get('support_url', '')}",
                    f"Support Email: {p.get('support_email', '')}",
                    f"Top features: {feature_titles}",
                ]
            )
        )
    return "\n\n---\n\n".join(rows)


def _single_product_context(product: Dict) -> str:
    features = "\n".join(
        [f"- {f.get('title', '')}: {f.get('description', '')}" for f in product.get("features", [])[:8]]
    )
    steps = "\n".join(
        [f"- {s.get('title', '')}: {s.get('description', '')}" for s in product.get("steps", [])[:6]]
    )
    benefits = "\n".join(
        [f"- {b.get('text', '')}" for b in product.get("benefits", [])[:8]]
    )
    faqs = "\n".join(
        [f"- Q: {faq.get('q', '')} A: {faq.get('a', '')}" for faq in product.get("faqs", [])[:6]]
    )

    return "\n".join(
        [
            f"Product Name: {product.get('name', '')}",
            f"Slug: {product.get('slug', '')}",
            f"Tagline: {product.get('tagline', '')}",
            f"Short Description: {product.get('short_description', '')}",
            f"Price USD: {product.get('price_usd', '')}",
            f"Price NGN: {product.get('price_ngn', '')}",
            f"Status: {product.get('status', '')}",
            f"Delivery Type: {product.get('delivery_type', '')}",
            f"Demo URL: {product.get('demo_url', '')}",
            f"Support URL: {product.get('support_url', '')}",
            f"Support Email: {product.get('support_email', '')}",
            f"Content: {product.get('content', {})}",
            f"Features:\n{features or '- None listed'}",
            f"Steps:\n{steps or '- None listed'}",
            f"Benefits:\n{benefits or '- None listed'}",
            f"FAQs:\n{faqs or '- None listed'}",
        ]
    )


def _call_groq(settings: AIAgentSettings, messages: List[Dict]) -> str:
    if not settings.groq_api_key:
        return ""

    payload = {
        "model": settings.model_name,
        "messages": messages,
        "temperature": 0.15,
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=20,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    except Exception:
        return ""


def _build_specific_product_answer(question: str, settings: AIAgentSettings, product: Dict, related_products: List[Dict]) -> Dict:
    system_prompt = settings.system_prompt or "You are the official SaaSGlobal Hub AI assistant."
    training_text = settings.training_text or "No additional training text provided."
    product_context = _single_product_context(product)

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "system",
            "content": _concise_instruction(),
        },
        {
            "role": "system",
            "content": f"Training context:\n{training_text}",
        },
        {
            "role": "system",
            "content": (
                "The user is asking about one specific product from the live catalog. "
                "Answer the question directly first. "
                "Explain what the product does, how it works, who it is for, and key value where relevant. "
                "If appropriate, invite the user to open the product detail page for fuller details. "
                "Do not just list products."
            ),
        },
        {
            "role": "system",
            "content": f"Live product context:\n{product_context}",
        },
        {
            "role": "user",
            "content": question,
        },
    ]

    groq_answer = _call_groq(settings, messages)

    if not groq_answer:
        feature_titles = [f.get("title", "") for f in product.get("features", [])[:4] if f.get("title")]
        feature_text = ", ".join(feature_titles) if feature_titles else "its listed capabilities"

        groq_answer = (
            f"{product.get('name')} is one of the current SaaSGlobal Hub products. "
            f"It is positioned as {product.get('tagline') or 'a backend-managed software solution'}. "
            f"It is designed around {feature_text}. "
            f"You can open its product detail page at /products/{product.get('slug')} to read the full breakdown."
        )

    cards = [
        {
            "slug": p.get("slug"),
            "title": p.get("name"),
            "tagline": p.get("tagline"),
            "price_usd": p.get("price_usd"),
            "price_ngn": p.get("price_ngn"),
            "image_url": p.get("image_url"),
            "short_description": p.get("short_description"),
            "demo_url": p.get("demo_url"),
            "delivery_type": p.get("delivery_type"),
        }
        for p in related_products
    ]

    return {
        "mode": "product_detail",
        "status": "Specific product response generated from live backend product data.",
        "answer": groq_answer,
        "products_context": related_products,
        "cards": cards,
        "primary_product_slug": product.get("slug"),
        "primary_product_name": product.get("name"),
    }


def _build_broad_product_answer(question: str, settings: AIAgentSettings, selected: List[Dict]) -> Dict:
    system_prompt = settings.system_prompt or "You are the official SaaSGlobal Hub AI assistant."
    training_text = settings.training_text or "No additional training text provided."
    product_context = _compact_product_rows(selected)

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "system",
            "content": _concise_instruction(),
        },
        {
            "role": "system",
            "content": f"Training context:\n{training_text}",
        },
        {
            "role": "system",
            "content": (
                "The user is asking a broad product discovery question. "
                "Answer the question first in a smart, business-useful way. "
                "Summarize what kind of products or software the company currently offers based on the live product context. "
                "Then naturally mention a few matching products. "
                "Do not respond with only a list."
            ),
        },
        {
            "role": "system",
            "content": f"Live product context:\n{product_context}",
        },
        {
            "role": "user",
            "content": question,
        },
    ]

    groq_answer = _call_groq(settings, messages)

    if not groq_answer:
        names = ", ".join([p.get("name", "") for p in selected[:4] if p.get("name")])
        groq_answer = (
            "SaaSGlobal Hub currently offers backend-managed software products across its live catalog. "
            f"Some relevant matches right now include {names}. "
            "Open any product page to view full details and delivery information."
        )

    cards = [
        {
            "slug": p.get("slug"),
            "title": p.get("name"),
            "tagline": p.get("tagline"),
            "price_usd": p.get("price_usd"),
            "price_ngn": p.get("price_ngn"),
            "image_url": p.get("image_url"),
            "short_description": p.get("short_description"),
            "demo_url": p.get("demo_url"),
            "delivery_type": p.get("delivery_type"),
        }
        for p in selected
    ]

    return {
        "mode": "product_discovery",
        "status": "Broad product-aware response generated from live backend product data.",
        "answer": groq_answer,
        "products_context": selected,
        "cards": cards,
    }


def _build_product_answer(question: str, settings: AIAgentSettings, remembered_product_slug: str = "") -> Dict:
    queryset = _visible_products_queryset()
    all_products = ProductPublicSerializer(queryset, many=True).data

    if not all_products:
        return {
            "mode": "product",
            "status": "No visible products available in the live catalog.",
            "answer": "There are currently no public products available in the catalog right now. You can contact the SaaSGlobal Hub team for more information.",
            "products_context": [],
            "cards": [],
            "primary_product_slug": "",
            "primary_product_name": "",
        }

    ranked = _rank_products(question, all_products)
    positive_matches = [product for score, product in ranked if score > 0]
    remembered_product = _get_product_by_slug(all_products, remembered_product_slug)

    if not positive_matches and remembered_product and _question_refers_to_previous_product(question):
        return _build_specific_product_answer(question, settings, remembered_product, [remembered_product])

    if not positive_matches:
        selected = all_products[:4]
        return _build_broad_product_answer(question, settings, selected)

    top_score = ranked[0][0]
    second_score = ranked[1][0] if len(ranked) > 1 else 0
    top_product = ranked[0][1]

    explicit_product_detected = top_score >= 8 and (
        second_score == 0 or top_score >= second_score + 3 or _question_requests_detail(question)
    )

    if explicit_product_detected:
        related = [top_product] + [p for p in positive_matches if p.get("slug") != top_product.get("slug")][:2]
        return _build_specific_product_answer(question, settings, top_product, related)

    if remembered_product and _question_refers_to_previous_product(question):
        related = [remembered_product] + [p for p in positive_matches if p.get("slug") != remembered_product.get("slug")][:2]
        return _build_specific_product_answer(question, settings, remembered_product, related)

    selected = positive_matches[:4] if _question_is_broad_discovery(question) else positive_matches[:3]
    return _build_broad_product_answer(question, settings, selected)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def ai_settings(_request):
    obj, _ = AIAgentSettings.objects.get_or_create(pk=1)
    return Response(AIAgentSettingsSerializer(obj).data)


@api_view(["POST", "PATCH"])
@permission_classes([IsAdminUser])
def update_ai_settings(request):
    obj, _ = AIAgentSettings.objects.get_or_create(pk=1)
    serializer = AIAgentSettingsSerializer(obj, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def ai_ask(request):
    question = (request.data.get("question") or "").strip()
    remembered_product_slug = (request.data.get("last_product_slug") or "").strip()
    settings, _ = AIAgentSettings.objects.get_or_create(pk=1)

    if not question:
        return Response({"detail": "question is required"}, status=400)

    should_use_product_context = settings.include_products_context and (
        _is_product_question(question)
        or (remembered_product_slug and _question_refers_to_previous_product(question))
    )

    if should_use_product_context:
        result = _build_product_answer(question, settings, remembered_product_slug=remembered_product_slug)
        result["question"] = question
        return Response(result)

    messages = [
        {
            "role": "system",
            "content": settings.system_prompt or "You are the official SaaSGlobal Hub AI assistant.",
        },
        {
            "role": "system",
            "content": _concise_instruction(),
        },
        {
            "role": "system",
            "content": f"Training context:\n{settings.training_text or 'No training data configured yet.'}",
        },
        {
            "role": "user",
            "content": question,
        },
    ]
    groq_answer = _call_groq(settings, messages)
    trained_fallback = settings.training_text[:800] if settings.training_text else "No training data configured yet."

    return Response(
        {
            "mode": "general",
            "question": question,
            "status": "Company response generated from configured training knowledge.",
            "answer": groq_answer or trained_fallback,
            "products_context": [],
            "cards": [],
            "primary_product_slug": "",
            "primary_product_name": "",
        }
    )
