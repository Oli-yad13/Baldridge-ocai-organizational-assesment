'use client'

import { useEffect } from 'react'
import { CONSENT_COOKIE, ConsentState, hasConsent, parseConsentCookie } from '@/lib/consent'

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.split('; ').find(row => row.startsWith(name + '='))
  return match ? match.split('=')[1] : undefined
}

function initializeGoogleAnalytics(measurementId: string) {
  if (!measurementId || measurementId === '') {
    console.warn('Google Analytics: No measurement ID provided')
    return
  }

  // Check if already initialized
  if (window.gtag) {
    console.log('Google Analytics: Already initialized')
    return
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer?.push(args)
  }

  // Configure gtag
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    page_path: window.location.pathname,
  })

  // Load gtag script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  console.log('Google Analytics initialized with ID:', measurementId)
}

export function AnalyticsGate({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    const raw = readCookie(CONSENT_COOKIE)
    const consent: ConsentState = parseConsentCookie(raw)
    
    if (hasConsent(consent, 'analytics')) {
      const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      if (measurementId) {
        initializeGoogleAnalytics(measurementId)
      }
    } else {
      console.log('Google Analytics: Waiting for analytics consent')
    }
  }, [])

  return children
}


