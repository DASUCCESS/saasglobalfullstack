from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AIAskAnonThrottle(AnonRateThrottle):
    rate = "20/hour"


class AIAskUserThrottle(UserRateThrottle):
    rate = "60/hour"