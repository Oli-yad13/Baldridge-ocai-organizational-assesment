'use client'

import CookieConsent from '@/components/cookie-consent'
import { AnalyticsGate } from '@/lib/analytics-gate'

export default function ClientConsentGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnalyticsGate>
        {children}
      </AnalyticsGate>
      <CookieConsent />
    </>
  )
}




