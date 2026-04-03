from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.ai_agent.models import AIAgentSettings
from apps.ai_agent.serializers import AIAgentSettingsSerializer
from apps.catalog.models import Product


@api_view(['GET'])
def ai_settings(_request):
    obj, _ = AIAgentSettings.objects.get_or_create(pk=1)
    return Response(AIAgentSettingsSerializer(obj).data)


@api_view(['POST'])
def ai_ask(request):
    question = request.data.get('question', '')
    products = list(Product.objects.filter(is_visible=True).values('name', 'tagline', 'short_description'))
    return Response(
        {
            'answer': 'AI integration endpoint is configured. Connect Groq SDK in production deployment.',
            'question': question,
            'products_context': products,
        }
    )
