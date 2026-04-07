from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class GoogleLoginAnonThrottle(AnonRateThrottle):
    rate = "10/min"


class GoogleLoginUserThrottle(UserRateThrottle):
    rate = "20/min"


class PaymentStartUserThrottle(UserRateThrottle):
    rate = "20/min"


class PaymentVerifyUserThrottle(UserRateThrottle):
    rate = "30/min"


class ChatMessageUserThrottle(UserRateThrottle):
    rate = "40/min"


class NotificationReadUserThrottle(UserRateThrottle):
    rate = "60/min"