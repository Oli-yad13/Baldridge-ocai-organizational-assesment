'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CONSENT_COOKIE, parseConsentCookie, ConsentState } from '@/lib/consent'

type ConsentContextValue = {
  consent: ConsentState | null
}

const ConsentContext = createContext<ConsentContextValue>({ consent: null })

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.split('; ').find(row => row.startsWith(name + '='))
  return match ? match.split('=')[1] : undefined
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null)

  useEffect(() => {
    const raw = readCookie(CONSENT_COOKIE)
    setConsent(parseConsentCookie(raw))
  }, [])

  const value = useMemo(() => ({ consent }), [consent])
  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  )
}

export function useConsent() {
  return useContext(ConsentContext)
}




