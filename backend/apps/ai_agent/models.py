from django.db import models


class AIAgentSettings(models.Model):
    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)
    groq_api_key = models.CharField(max_length=255, blank=True)
    model_name = models.CharField(max_length=255, default='llama-3.1-8b-instant')
    system_prompt = models.TextField(blank=True)
    training_text = models.TextField(blank=True)
    include_products_context = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        self.id = 1
        super().save(*args, **kwargs)
