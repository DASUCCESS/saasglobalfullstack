from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.seo.models import PageSEO
from apps.seo.serializers import PageSEOSerializer


@api_view(['GET'])
def seo_by_page(request, page_key: str):
    try:
        seo = PageSEO.objects.get(page_key=page_key)
        return Response(PageSEOSerializer(seo).data)
    except PageSEO.DoesNotExist:
        return Response({}, status=404)
