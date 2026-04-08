import re
from typing import Optional, Tuple


def resolve_subscription_interval(plan_id: str, billing_period: str) -> Optional[Tuple[str, int]]:
    source = f"{plan_id} {billing_period}".lower()

    if "quarterly" in source or "quarter" in source:
        return ("month", 3)

    if any(token in source for token in ["yearly", "annual", "annually", "per year", "year"]):
        return ("year", 1)

    match = re.search(r"(\d+)\s*[- ]?\s*month", source)
    if match:
        month_count = int(match.group(1))
        if month_count == 12:
            return ("year", 1)
        if month_count > 0:
            return ("month", month_count)

    if any(token in source for token in ["monthly", "per month"]):
        return ("month", 1)

    return None
