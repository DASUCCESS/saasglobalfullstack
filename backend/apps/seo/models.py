from django.db import models


class PageSEO(models.Model):
    page_key = models.CharField(max_length=150, unique=True)
    title = models.CharField(max_length=255)
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.TextField(blank=True)
    keywords = models.CharField(max_length=500, blank=True)
    canonical_url = models.URLField(blank=True)
    og_title = models.CharField(max_length=255, blank=True)
    og_description = models.TextField(blank=True)
    og_image = models.URLField(blank=True)

    def __str__(self):
        return self.page_key
