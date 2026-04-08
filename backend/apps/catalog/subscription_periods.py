from typing import Optional, Tuple

SUPPORTED_SUBSCRIPTION_PLAN_IDS = {
    "monthly": ("month", 1),
    "quarterly": ("month", 3),
    "yearly": ("year", 1),
}


def resolve_subscription_interval(plan_id: str, billing_period: str) -> Optional[Tuple[str, int]]:
    normalized_plan_id = (plan_id or "").strip().lower()
    if normalized_plan_id in SUPPORTED_SUBSCRIPTION_PLAN_IDS:
        return SUPPORTED_SUBSCRIPTION_PLAN_IDS[normalized_plan_id]
    return None
