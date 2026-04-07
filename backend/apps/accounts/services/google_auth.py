from dataclasses import dataclass

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework.exceptions import ValidationError

from apps.core.models import SiteSettings


@dataclass
class VerifiedGoogleUser:
    email: str
    full_name: str
    sub: str
    avatar_url: str


def verify_google_credential(credential: str) -> VerifiedGoogleUser:
    if not credential:
        raise ValidationError("Google credential is required.")

    site = SiteSettings.load()
    client_id = (site.google_client_id or "").strip()
    if not client_id:
        raise ValidationError("Google sign-in is not configured.")

    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            client_id,
        )
    except Exception as exc:
        raise ValidationError("Invalid Google credential.") from exc

    email = (payload.get("email") or "").strip().lower()
    email_verified = bool(payload.get("email_verified"))
    sub = (payload.get("sub") or "").strip()
    full_name = (payload.get("name") or "").strip() or email.split("@")[0]
    avatar_url = (payload.get("picture") or "").strip()

    if not email or not email_verified:
        raise ValidationError("A verified Google email is required.")

    if not sub:
        raise ValidationError("Invalid Google identity.")

    return VerifiedGoogleUser(
        email=email,
        full_name=full_name,
        sub=sub,
        avatar_url=avatar_url,
    )
