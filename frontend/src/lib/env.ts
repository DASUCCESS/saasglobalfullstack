const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.saasglobalhub.com";

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");
const siteBaseUrl = normalizeBaseUrl(SITE_URL);

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api",
  siteUrl: siteBaseUrl,
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || "SaaSGlobal Hub",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@saasglobalhub.com",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@saasglobalhub.com",
  legalEmail: process.env.NEXT_PUBLIC_LEGAL_EMAIL || "legal@saasglobalhub.com",
  partnershipsEmail: process.env.NEXT_PUBLIC_PARTNERSHIPS_EMAIL || "partnerships@saasglobalhub.com",
  officeAddress:
    process.env.NEXT_PUBLIC_OFFICE_ADDRESS || "828 Lane Allen Rd, Ste 219, Lexington, KY 40504, US",
  officeStreetAddress: process.env.NEXT_PUBLIC_OFFICE_STREET_ADDRESS || "828 Lane Allen Rd, Ste 219",
  officeCity: process.env.NEXT_PUBLIC_OFFICE_CITY || "Lexington",
  officeRegion: process.env.NEXT_PUBLIC_OFFICE_REGION || "KY",
  officePostalCode: process.env.NEXT_PUBLIC_OFFICE_POSTAL_CODE || "40504",
  officeCountry: process.env.NEXT_PUBLIC_OFFICE_COUNTRY || "US",
  twitterUrl: process.env.NEXT_PUBLIC_TWITTER_URL || "https://twitter.com/saasglobalhub",
  linkedInUrl:
    process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://www.linkedin.com/company/saasglobalhub",
  telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/saasglobalhub",
  adminLoginPath: process.env.NEXT_PUBLIC_ADMIN_LOGIN_PATH || "/secure-admin-portal-9x7/login",
  adminSignupPath: process.env.NEXT_PUBLIC_ADMIN_SIGNUP_PATH || "/secure-admin-portal-9x7/signup",
  authTokenStorageKey: process.env.NEXT_PUBLIC_AUTH_TOKEN_STORAGE_KEY || "bolaji_LUQMAN123",
  postLoginPathStorageKey: process.env.NEXT_PUBLIC_POST_LOGIN_PATH_STORAGE_KEY || "sg_post_login_path",
};

export const getSiteUrl = (path = "") => `${siteBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
