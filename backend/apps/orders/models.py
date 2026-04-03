from django.db import models


class RequestLead(models.Model):
    CHANNEL_CHOICES = [
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
    ]

    full_name = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    request_type = models.CharField(max_length=255)
    details = models.TextField()
    budget = models.CharField(max_length=255, blank=True)
    urgency = models.CharField(max_length=64, default='Normal')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
