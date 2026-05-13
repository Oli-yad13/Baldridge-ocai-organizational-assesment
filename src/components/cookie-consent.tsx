'use client'

import { useEffect, useMemo, useState } from 'react'
import { CONSENT_COOKIE, CONSENT_COOKIE_OPTIONS, ConsentState, getDefaultConsent, parseConsentCookie, serializeConsent } from '@/lib/consent'

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.split('; ').find(row => row.startsWith(name + '='))
  return match ? match.split('=')[1] : undefined
}

function writeCookie(name: string, value: string): void {
  const attrs = [
    `Path=${CONSENT_COOKIE_OPTIONS.path}`,
    `Max-Age=${CONSENT_COOKIE_OPTIONS.maxAge}`,
    `SameSite=${CONSENT_COOKIE_OPTIONS.sameSite}`,
    CONSENT_COOKIE_OPTIONS.secure ? 'Secure' : '',
  ].filter(Boolean)
  document.cookie = `${name}=${value}; ${attrs.join('; ')}`
}

export type CookieConsentProps = {
  className?: string
  onChange?: (consent: ConsentState) => void
}

export default function CookieConsent({ className, onChange }: CookieConsentProps) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [rejectClickCount, setRejectClickCount] = useState(0)
  const [consent, setConsent] = useState<ConsentState>(getDefaultConsent())

  useEffect(() => {
    const raw = readCookie(CONSENT_COOKIE)
    const parsed = parseConsentCookie(raw)
    setConsent(parsed)
    if (!parsed.given) setOpen(true)
  }, [])

  useEffect(() => {
    onChange?.(consent)
  }, [consent, onChange])

  const acceptAll = () => {
    if (isSaving) return
    setIsSaving(true)
    const updated: ConsentState = {
      ...consent,
      given: true,
      timestamp: Date.now(),
      categories: { essential: true, analytics: true, marketing: true, preferences: true },
    }
    setConsent(updated)
    writeCookie(CONSENT_COOKIE, serializeConsent(updated))
    setOpen(false)
    // Reload to initialize analytics
    window.location.reload()
  }

  const rejectAll = () => {
    if (isSaving) return
    if (rejectClickCount === 0) {
      setRejectClickCount(1)
      return
    }
    setIsSaving(true)
    const updated: ConsentState = {
      ...consent,
      given: true,
      timestamp: Date.now(),
      categories: { essential: true, analytics: false, marketing: false, preferences: false },
    }
    setConsent(updated)
    writeCookie(CONSENT_COOKIE, serializeConsent(updated))
    setOpen(false)
  }

  const acceptEssentialOnly = () => {
    if (isSaving) return
    setIsSaving(true)
    const updated: ConsentState = {
      ...consent,
      given: true,
      timestamp: Date.now(),
      categories: { essential: true, analytics: false, marketing: false, preferences: false },
    }
    setConsent(updated)
    writeCookie(CONSENT_COOKIE, serializeConsent(updated))
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className={`fixed inset-0 z-50 ${className || ''}`}>
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0">
        <div className="w-full border-t border-[var(--foreground)]/15 bg-[var(--background)] shadow-2xl">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <h2 className="text-2xl font-extrabold uppercase tracking-wide leading-tight text-[var(--foreground)]">We use cookies</h2>
            <p className="mt-3 max-w-4xl text-[1.05rem] leading-relaxed text-[var(--foreground)]/80">
              We use essential cookies to make our site work. With your consent, we also use cookies for analytics, preferences, and marketing.
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end" aria-busy={isSaving}>
              <button
                className={`w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 text-base font-bold uppercase tracking-wide rounded-none bg-[var(--foreground)] text-[var(--background)] transition ${isSaving ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
                onClick={acceptAll}
                disabled={isSaving}
              >
                Accept all
              </button>
              <button
                className={`w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 text-base font-bold uppercase tracking-wide rounded-none border-2 border-[var(--foreground)] text-[var(--foreground)] bg-transparent transition ${isSaving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[var(--foreground)]/5'}`}
                onClick={acceptEssentialOnly}
                disabled={isSaving}
              >
                Accept essential only
              </button>
              <button
                className={`w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 text-base font-bold uppercase tracking-wide rounded-none border-2 border-[var(--foreground)]/40 text-[var(--foreground)]/80 bg-transparent transition ${isSaving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[var(--foreground)]/5'}`}
                onClick={rejectAll}
                disabled={isSaving}
              >
                {rejectClickCount === 0 ? 'Reject all' : 'Are you sure?'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


