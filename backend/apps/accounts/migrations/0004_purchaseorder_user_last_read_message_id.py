from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_purchaseorder_idempotency_key'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='user_last_read_message_id',
            field=models.BigIntegerField(blank=True, null=True),
        ),
    ]
