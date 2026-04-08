from typing import Optional, Tuple

SUPPORTED_SUBSCRIPTION_PLAN_IDS = {
    "monthly": ("month", 1),
    "quarterly": ("month", 3),
    "yearly": ("year", 1),
}

SUPPORTED_BILLING_PERIOD_LABELS = {
    "monthly": {"per month", "monthly"},
    "quarterly": {"every 3 months", "quarterly"},
    "yearly": {"per year", "yearly", "annually", "annual"},
}


def resolve_subscription_interval(plan_id: str, billing_period: str) -> Optional[Tuple[str, int]]:
    normalized_plan_id = (plan_id or "").strip().lower()
    normalized_billing_period = (billing_period or "").strip().lower()

    if normalized_plan_id not in SUPPORTED_SUBSCRIPTION_PLAN_IDS:
        return None

    allowed_labels = SUPPORTED_BILLING_PERIOD_LABELS.get(normalized_plan_id, set())
    if normalized_billing_period not in allowed_labels:
        return None

    if normalized_plan_id in SUPPORTED_SUBSCRIPTION_PLAN_IDS:
        return SUPPORTED_SUBSCRIPTION_PLAN_IDS[normalized_plan_id]
    return None
