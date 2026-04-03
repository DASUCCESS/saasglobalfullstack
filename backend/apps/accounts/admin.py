from django.contrib import admin
from apps.accounts.models import UserProfile, PurchaseOrder, ConversationMessage

admin.site.register(UserProfile)
admin.site.register(PurchaseOrder)
admin.site.register(ConversationMessage)
