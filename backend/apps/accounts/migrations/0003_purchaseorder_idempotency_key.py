from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_purchaseorder_user_last_read_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchaseorder',
            name='idempotency_key',
            field=models.CharField(blank=True, max_length=120, null=True),
        ),
        migrations.AddConstraint(
            model_name='purchaseorder',
            constraint=models.UniqueConstraint(
                condition=models.Q(idempotency_key__isnull=False) & ~models.Q(idempotency_key=''),
                fields=('user', 'product', 'provider', 'idempotency_key'),
                name='uniq_order_idempotency_per_user_product_provider',
            ),
        ),
    ]
