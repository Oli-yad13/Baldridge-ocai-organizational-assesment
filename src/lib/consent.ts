export type ConsentCategory = 'essential' | 'analytics' | 'marketing' | 'preferences'

export type ConsentState = {
  version: number
  timestamp: number
  given: boolean
  categories: Record<ConsentCategory, boolean>
}

const CONSENT_COOKIE = 'cookie_consent'
const CONSENT_VERSION = 1

export function getDefaultConsent(): ConsentState {
  return {
    version: CONSENT_VERSION,
    timestamp: 0,
    given: false,
    categories: {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    },
  }
}

export function parseConsentCookie(cookieValue: string | undefined): ConsentState {
  if (!cookieValue) return getDefaultConsent()
  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue)) as ConsentState
    if (!parsed || typeof parsed !== 'object') return getDefaultConsent()
    if (parsed.version !== CONSENT_VERSION) return getDefaultConsent()
    return parsed
  } catch {
    return getDefaultConsent()
  }
}

export function serializeConsent(consent: ConsentState): string {
  return encodeURIComponent(JSON.stringify(consent))
}

export function hasConsent(consent: ConsentState, category: ConsentCategory): boolean {
  if (category === 'essential') return true
  return !!consent.categories[category]
}

export const CONSENT_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 365, // 1 year
}

export { CONSENT_COOKIE }




