import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { LocaleProvider } from '@/lib/i18n/context'
import { AssessmentHubNav } from '@/components/navigation/assessment-hub-nav'
import './globals.css'
import ClientConsentGate from '@/components/client-consent-gate'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Assessment Hub - OCAI & Baldrige Assessments',
  description: 'Unified platform for organizational culture assessment (OCAI) and excellence framework assessment (Baldrige)',
  keywords: ['OCAI', 'Baldrige', 'organizational culture', 'assessment', 'survey', 'analysis', 'excellence framework'],
  authors: [{ name: 'Assessment Hub Team' }],
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
  manifest: '/site.webmanifest',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <LocaleProvider>
          <AuthSessionProvider>
            <QueryProvider>
              <AssessmentHubNav />
              <div className="min-h-full">
                <ClientConsentGate>
                  {children}
                </ClientConsentGate>
              </div>
            </QueryProvider>
          </AuthSessionProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}