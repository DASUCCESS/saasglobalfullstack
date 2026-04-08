from django.contrib.auth.models import User
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.accounts.models import ConversationMessage, PurchaseOrder, UserProfile
from apps.accounts.services.emails import build_frontend_url, send_signup_welcome_email
from apps.accounts.services.notifications import notify_new_message, notify_order_failed, notify_order_paid


@receiver(post_save, sender=User)
def ensure_user_profile(sender, instance, created, **kwargs):
    profile, profile_created = UserProfile.objects.get_or_create(
        user=instance,
        defaults={"role": "admin" if instance.is_staff else "customer"},
    )
    desired_role = "admin" if instance.is_staff else "customer"
    if profile.role != desired_role:
        profile.role = desired_role
        profile.save(update_fields=["role"])
    if created and instance.email:
        send_signup_welcome_email(
            recipient=instance.email,
            customer_name=instance.get_full_name() or instance.first_name or "there",
            dashboard_url=build_frontend_url("/dashboard"),
        )


@receiver(post_save, sender=ConversationMessage)
def conversation_message_post_save(sender, instance, created, **kwargs):
    if not created:
        return
    notify_new_message(instance)


@receiver(pre_save, sender=PurchaseOrder)
def purchase_order_track_previous_status(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_status = None
        return
    previous = PurchaseOrder.objects.filter(pk=instance.pk).only("status").first()
    instance._previous_status = previous.status if previous else None


@receiver(post_save, sender=PurchaseOrder)
def purchase_order_status_post_save(sender, instance, created, **kwargs):
    if created:
        return

    previous_status = getattr(instance, "_previous_status", None)
    if previous_status == instance.status:
        return

    if instance.status == "paid":
        notify_order_paid(instance)
    elif instance.status == "failed":
        notify_order_failed(instance)
