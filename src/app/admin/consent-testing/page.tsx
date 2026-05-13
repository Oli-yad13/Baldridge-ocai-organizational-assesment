'use client'

import { useEffect, useState } from 'react'
import { CONSENT_COOKIE, parseConsentCookie, ConsentState } from '@/lib/consent'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  ArrowLeft, 
  RefreshCw, 
  Trash2, 
  Cookie, 
  Shield, 
  Download,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Activity,
  BarChart3,
  Filter
} from 'lucide-react'
import Link from 'next/link'

interface ParsedCookie {
  name: string
  value: string
  size: number
  domain?: string
  path?: string
  expires?: string
  httpOnly?: boolean
  secure?: boolean
  sameSite?: string
  category: 'essential' | 'analytics' | 'marketing' | 'preferences' | 'unknown'
}

interface CookieStats {
  total: number
  byCategory: {
    essential: number
    analytics: number
    marketing: number
    preferences: number
    unknown: number
  }
  totalSize: number
  sessionCookies: number
  persistentCookies: number
}

export default function ConsentManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Authentication state
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  
  // Cookie state
  const [consentState, setConsentState] = useState<ConsentState | null>(null)
  const [allCookies, setAllCookies] = useState<ParsedCookie[]>([])
  const [stats, setStats] = useState<CookieStats>({
    total: 0,
    byCategory: { essential: 0, analytics: 0, marketing: 0, preferences: 0, unknown: 0 },
    totalSize: 0,
    sessionCookies: 0,
    persistentCookies: 0
  })
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'category'>('name')
  
  // Analytics verification
  const [analyticsStatus, setAnalyticsStatus] = useState({
    gtagLoaded: false,
    dataLayerExists: false,
    measurementId: '',
    eventsTracked: 0
  })

  // Check authorization
  useEffect(() => {
    if (status === 'loading') return
    
    if (session?.user?.role === 'ADMIN') {
      setIsAuthorized(true)
      return
    }
    
    const hasPassword = sessionStorage.getItem('consent_testing_access') === 'granted'
    if (hasPassword) {
      setIsAuthorized(true)
    }
  }, [session, status])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'tenadam2024') {
      sessionStorage.setItem('consent_testing_access', 'granted')
      setIsAuthorized(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
      setPassword('')
    }
  }

  // Categorize cookies based on name patterns
  const categorizeCookie = (name: string): ParsedCookie['category'] => {
    const nameLower = name.toLowerCase()
    
    // Essential cookies
    if (nameLower.includes('session') || 
        nameLower.includes('auth') || 
        nameLower.includes('csrf') ||
        nameLower.includes('next-auth') ||
        nameLower.includes('consent')) {
      return 'essential'
    }
    
    // Analytics cookies
    if (nameLower.includes('_ga') || 
        nameLower.includes('_gid') ||
        nameLower.includes('_gat') ||
        nameLower.includes('analytics') ||
        nameLower.includes('utm')) {
      return 'analytics'
    }
    
    // Marketing cookies
    if (nameLower.includes('_fbp') || 
        nameLower.includes('_gcl') ||
        nameLower.includes('ads') ||
        nameLower.includes('marketing')) {
      return 'marketing'
    }
    
    // Preferences cookies
    if (nameLower.includes('lang') || 
        nameLower.includes('locale') ||
        nameLower.includes('theme') ||
        nameLower.includes('pref')) {
      return 'preferences'
    }
    
    return 'unknown'
  }

  // Parse all cookies
  const parseAllCookies = (): ParsedCookie[] => {
    if (typeof document === 'undefined') return []
    
    const cookieString = document.cookie
    if (!cookieString) return []
    
    return cookieString.split('; ').map(cookie => {
      const [name, ...valueParts] = cookie.split('=')
      const value = valueParts.join('=')
      const size = new Blob([cookie]).size
      
      return {
        name: name.trim(),
        value: decodeURIComponent(value),
        size,
        category: categorizeCookie(name)
      }
    })
  }

  // Calculate statistics
  const calculateStats = (cookies: ParsedCookie[]): CookieStats => {
    const stats: CookieStats = {
      total: cookies.length,
      byCategory: {
        essential: 0,
        analytics: 0,
        marketing: 0,
        preferences: 0,
        unknown: 0
      },
      totalSize: 0,
      sessionCookies: 0,
      persistentCookies: cookies.length // Simplified for document.cookie
    }
    
    cookies.forEach(cookie => {
      stats.byCategory[cookie.category]++
      stats.totalSize += cookie.size
    })
    
    return stats
  }

  // Load cookies and consent state
  useEffect(() => {
    if (!isAuthorized) return
    
    const cookies = parseAllCookies()
    setAllCookies(cookies)
    setStats(calculateStats(cookies))
    
    const match = document.cookie.split('; ').find(row => row.startsWith(CONSENT_COOKIE + '='))
    const consentValue = match ? match.split('=')[1] : undefined
    
    if (consentValue) {
      const parsed = parseConsentCookie(consentValue)
      setConsentState(parsed)
    }
    
    // Check analytics integration
    const checkAnalytics = () => {
      const win = window as any
      setAnalyticsStatus({
        gtagLoaded: typeof win.gtag === 'function',
        dataLayerExists: Array.isArray(win.dataLayer),
        measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'Not configured',
        eventsTracked: Array.isArray(win.dataLayer) ? win.dataLayer.length : 0
      })
    }
    
    checkAnalytics()
    const interval = setInterval(checkAnalytics, 2000)
    return () => clearInterval(interval)
  }, [isAuthorized])

  const refresh = () => {
    window.location.reload()
  }

  const clearConsentCookie = () => {
    document.cookie = `${CONSENT_COOKIE}=; Path=/; Max-Age=0`
    window.location.reload()
  }

  const clearAllCookies = () => {
    const cookies = document.cookie.split('; ')
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0]
      document.cookie = `${name}=; Path=/; Max-Age=0`
    })
    window.location.reload()
  }

  const updateConsent = (category: keyof ConsentState['categories'], enabled: boolean) => {
    if (!consentState) return
    
    const updated: ConsentState = {
      ...consentState,
      timestamp: Date.now(),
      categories: {
        ...consentState.categories,
        [category]: enabled
      }
    }
    
    setConsentState(updated)
    
    // Serialize and write to cookie
    const serialized = encodeURIComponent(JSON.stringify(updated))
    document.cookie = `${CONSENT_COOKIE}=${serialized}; Path=/; Max-Age=31536000; SameSite=Lax`
    
    // Note: Analytics requires reload to initialize
    if (category === 'analytics' && enabled) {
      setTimeout(() => {
        if (confirm('Analytics enabled! Page will reload to initialize tracking. Continue?')) {
          window.location.reload()
        }
      }, 500)
    }
  }

  const setAllConsent = (enabled: boolean) => {
    if (!consentState) return
    
    const updated: ConsentState = {
      ...consentState,
      given: true,
      timestamp: Date.now(),
      categories: {
        essential: true, // Always true
        analytics: enabled,
        marketing: enabled,
        preferences: enabled
      }
    }
    
    setConsentState(updated)
    
    const serialized = encodeURIComponent(JSON.stringify(updated))
    document.cookie = `${CONSENT_COOKIE}=${serialized}; Path=/; Max-Age=31536000; SameSite=Lax`
    
    if (enabled) {
      setTimeout(() => {
        if (confirm('All permissions enabled! Page will reload to initialize tracking. Continue?')) {
          window.location.reload()
        }
      }, 500)
    }
  }

  const exportCookieReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      consentState,
      statistics: stats,
      cookies: allCookies.map(c => ({
        name: c.name,
        category: c.category,
        size: c.size,
        valueLength: c.value.length
      }))
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cookie-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Filter and sort cookies
  const filteredCookies = allCookies
    .filter(cookie => {
      const matchesSearch = cookie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           cookie.value.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || cookie.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'size') return b.size - a.size
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return 0
    })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential': return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'analytics': return 'text-purple-700 bg-purple-50 border-purple-200'
      case 'marketing': return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'preferences': return 'text-green-700 bg-green-50 border-green-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'essential': return <Shield className="w-4 h-4" />
      case 'analytics': return <BarChart3 className="w-4 h-4" />
      case 'marketing': return <Activity className="w-4 h-4" />
      case 'preferences': return <Database className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  // Password gate
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full border border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-teal-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Cookie Consent Management
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Secure access required. Admin users or authorized personnel only.
          </p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Access Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 bg-white"
                placeholder="Enter password"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Incorrect password. Please try again.
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition shadow-md flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              Access Console
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              href="/admin/dashboard"
              className="text-sm text-teal-600 hover:text-teal-700 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Dashboard</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-teal-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Cookie Consent Management</h1>
              </div>
              <p className="text-gray-600">
                Industry-standard cookie monitoring, compliance tracking, and consent management
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportCookieReport}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Report</span>
              </button>
              <button
                onClick={refresh}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Cookies</p>
            <p className="text-xs text-gray-500 mt-1">{(stats.totalSize / 1024).toFixed(2)} KB</p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                {consentState?.given ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                consentState?.given ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {consentState?.given ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600">Consent Status</p>
            <p className="text-xs text-gray-500 mt-1">
              {consentState?.timestamp ? new Date(consentState.timestamp).toLocaleDateString() : 'Not set'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.byCategory.analytics}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Analytics Cookies</p>
            <p className="text-xs text-gray-500 mt-1">
              {consentState?.categories.analytics ? 'Enabled' : 'Disabled'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.byCategory.marketing}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Marketing Cookies</p>
            <p className="text-xs text-gray-500 mt-1">
              {consentState?.categories.marketing ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>

        {/* Analytics Integration Status */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Google Analytics Integration Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">gtag() Function</span>
                {analyticsStatus.gtagLoaded ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className={`text-lg font-bold ${analyticsStatus.gtagLoaded ? 'text-green-700' : 'text-red-700'}`}>
                {analyticsStatus.gtagLoaded ? 'Loaded' : 'Not Loaded'}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">dataLayer</span>
                {analyticsStatus.dataLayerExists ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className={`text-lg font-bold ${analyticsStatus.dataLayerExists ? 'text-green-700' : 'text-red-700'}`}>
                {analyticsStatus.dataLayerExists ? 'Active' : 'Inactive'}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Measurement ID</span>
                {analyticsStatus.measurementId !== 'Not configured' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <p className="text-xs font-mono text-gray-700 truncate">
                {analyticsStatus.measurementId}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Events Tracked</span>
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-lg font-bold text-purple-700">
                {analyticsStatus.eventsTracked}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              {analyticsStatus.gtagLoaded && consentState?.categories.analytics ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-700">Analytics is Active ✓</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Google Analytics is loaded and tracking. User events are being collected.
                    </p>
                  </div>
                </>
              ) : consentState?.categories.analytics && !analyticsStatus.gtagLoaded ? (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-700">Consent Given, Analytics Loading...</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Analytics consent is enabled but gtag has not loaded yet. This may take a few seconds after consent is granted.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-700">Analytics Inactive</p>
                    <p className="text-sm text-gray-600 mt-1">
                      User has not consented to analytics tracking. Enable analytics consent to start tracking.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                const win = window as any
                if (win.dataLayer) {
                  console.log('dataLayer:', win.dataLayer)
                  alert(`dataLayer contains ${win.dataLayer.length} events. Check browser console for details.`)
                } else {
                  alert('dataLayer is not available')
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition shadow-md text-sm"
            >
              <Database className="w-4 h-4" />
              Inspect dataLayer
            </button>
            
            <button
              onClick={() => {
                const win = window as any
                if (win.gtag) {
                  win.gtag('event', 'test_event', {
                    event_category: 'consent_testing',
                    event_label: 'manual_test',
                    value: Date.now()
                  })
                  alert('Test event sent! Check dataLayer in console.')
                } else {
                  alert('gtag() is not available. Enable analytics consent first.')
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md text-sm"
            >
              <Activity className="w-4 h-4" />
              Send Test Event
            </button>
          </div>
        </div>

        {/* Consent State Details */}
        {consentState && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              Current Consent Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Metadata</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Version</span>
                    <span className="font-medium text-gray-900">{consentState.version}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Consent Given</span>
                    <span className={`font-semibold ${consentState.given ? 'text-green-600' : 'text-red-600'}`}>
                      {consentState.given ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-900">
                      {new Date(consentState.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Days Active</span>
                    <span className="font-medium text-gray-900">
                      {Math.floor((Date.now() - consentState.timestamp) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Category Permissions</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAllConsent(true)}
                      className="text-xs px-3 py-1 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition"
                    >
                      Enable All
                    </button>
                    <button
                      onClick={() => setAllConsent(false)}
                      className="text-xs px-3 py-1 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition"
                    >
                      Disable All
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {Object.entries(consentState.categories).map(([category, enabled]) => (
                    <div 
                      key={category}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                        enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          enabled ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {getCategoryIcon(category)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 capitalize block">{category}</span>
                          {category === 'essential' && (
                            <span className="text-xs text-gray-500">Always required</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {enabled ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-semibold text-green-700">Enabled</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-semibold text-gray-500">Disabled</span>
                            </>
                          )}
                        </div>
                        {category !== 'essential' && (
                          <button
                            onClick={() => updateConsent(category as keyof ConsentState['categories'], !enabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                              enabled ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
              <button
                onClick={clearConsentCookie}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition shadow-md text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Reset Consent
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(consentState, null, 2))
                  alert('Consent state copied to clipboard!')
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition shadow-md text-sm"
              >
                <Database className="w-4 h-4" />
                Copy JSON
              </button>
            </div>
          </div>
        )}

        {/* Cookie Browser */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              Cookie Inspector
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cookies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-900 bg-white w-full sm:w-64"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-900 bg-white"
              >
                <option value="all">All Categories</option>
                <option value="essential">Essential</option>
                <option value="analytics">Analytics</option>
                <option value="marketing">Marketing</option>
                <option value="preferences">Preferences</option>
                <option value="unknown">Unknown</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'category')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-900 bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>
          </div>

          {filteredCookies.length === 0 ? (
            <div className="text-center py-12">
              <Cookie className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No cookies found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery || filterCategory !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No cookies are currently stored'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCookies.map((cookie, idx) => (
                <div 
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm font-semibold text-gray-900 break-all">
                          {cookie.name}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(cookie.category)}`}>
                          {getCategoryIcon(cookie.category)}
                          <span className="capitalize">{cookie.category}</span>
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded p-2 mb-2">
                        <p className="font-mono text-xs text-gray-700 break-all line-clamp-2">
                          {cookie.value}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          {cookie.size} bytes
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Length: {cookie.value.length} chars
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(cookie.value)
                        alert(`Copied "${cookie.name}" value to clipboard!`)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition whitespace-nowrap"
                    >
                      <Download className="w-3 h-3" />
                      Copy Value
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Showing <span className="font-semibold text-gray-900">{filteredCookies.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{stats.total}</span> cookies
            </p>
            <button
              onClick={clearAllCookies}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition shadow-md text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Cookies (Caution)
            </button>
          </div>
        </div>

        {/* Compliance Guide */}
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-teal-200 rounded-lg p-6 shadow-md">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-600" />
            GDPR & Cookie Compliance Guide
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">✓ Compliance Checklist</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Cookie banner displays before non-essential cookies are set</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Clear categorization (Essential, Analytics, Marketing, Preferences)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Granular consent controls for each category</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Consent withdrawal mechanism available</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📋 Testing Protocol</h4>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Clear all cookies and verify banner appears</li>
                <li>Test "Accept All" - verify all categories enabled</li>
                <li>Test "Essential Only" - verify only essential cookies</li>
                <li>Test "Reject All" (2 clicks) - verify minimal cookies</li>
                <li>Verify consent persists across page reloads</li>
                <li>Test consent withdrawal and re-granting</li>
                <li>Export and review cookie audit report</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-teal-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <strong className="text-gray-900">Important:</strong> This console is for internal testing only. 
                Ensure cookie policies are clearly communicated to users via Privacy Policy and Terms of Service. 
                Maintain audit logs of consent for GDPR compliance.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
