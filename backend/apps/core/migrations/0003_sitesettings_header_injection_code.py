from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_paymentsettings_stripe_webhook_secret_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitesettings",
            name="header_injection_code",
            field=models.TextField(blank=True),
        ),
    ]
