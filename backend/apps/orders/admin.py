from django.contrib import admin
from apps.orders.models import RequestLead


@admin.register(RequestLead)
class RequestLeadAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'request_type', 'channel', 'urgency', 'created_at')
    search_fields = ('full_name', 'email', 'request_type')
    list_filter = ('channel', 'urgency', 'created_at')
