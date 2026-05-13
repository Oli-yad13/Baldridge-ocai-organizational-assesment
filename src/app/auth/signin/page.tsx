'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Key, AlertCircle, Loader2 } from 'lucide-react'
import { useLocale } from '@/lib/i18n/context'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'

type LoginMode = 'credentials' | 'accesskey'

function SignInContent() {
  const searchParams = useSearchParams()
  const { t } = useLocale()
  const [mode, setMode] = useState<LoginMode>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Set mode based on URL parameter
    const modeParam = searchParams.get('mode')
    if (modeParam === 'credentials' || modeParam === 'accesskey') {
      setMode(modeParam)
    }
  }, [searchParams])

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // First, try admin/facilitator login
      let response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      let data = await response.json()

      // If admin login failed, try credential login (employee assessment access)
      if (!response.ok) {
        response = await fetch('/api/auth/credential-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Invalid email or password')
          setIsLoading(false)
          return
        }
      }

      // Store user session
      localStorage.setItem('user', JSON.stringify(data.user))

      // Store additional data if credential login
      if (data.user.role === 'CREDENTIAL_USER') {
        localStorage.setItem('assessmentTypes', JSON.stringify(data.user.assessmentTypes))

        // Also store organization data for credential users
        localStorage.setItem('organization', JSON.stringify({
          id: data.user.organizationId,
          name: data.user.organizationName,
          logoUrl: undefined,
          primaryColor: undefined
        }))
      }

      // Redirect based on response
      // Use a small delay to ensure localStorage is written before navigation
      setTimeout(() => {
        router.push(data.redirectUrl)
      }, 100)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleAccessKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/access-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey, name: name || undefined }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid access key')
        setIsLoading(false)
        return
      }

      // Store employee session
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('organization', JSON.stringify(data.organization))
      localStorage.setItem('assessmentTypes', JSON.stringify(data.assessmentTypes))

      // Redirect to assessment selection
      router.push(data.redirectUrl)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <img
                  src="/tenadam-logo.png"
                  alt="Tenadam Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900">{t('app.name')}</h1>
                <p className="text-xs text-teal-700 font-medium hidden sm:block">by Tenadam Training, Consultancy & Research PLC</p>
              </div>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            {t('signin.title')}
          </h2>
          <p className="text-center text-sm text-gray-600">
            {t('signin.subtitle')}
          </p>
        </div>

        <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {/* Login Mode Tabs */}
          <div className="bg-white rounded-t-lg shadow-sm border-t border-l border-r border-gray-200">
            <div className="grid grid-cols-2">
              <button
                onClick={() => setMode('credentials')}
                className={`py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-tl-lg transition-colors ${
                  mode === 'credentials'
                    ? 'bg-teal-700 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('signin.tabEmailPassword')}</span>
                <span className="sm:hidden">Email</span>
              </button>
              <button
                onClick={() => setMode('accesskey')}
                className={`py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-tr-lg transition-colors ${
                  mode === 'accesskey'
                    ? 'bg-teal-700 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Key className="w-4 h-4 inline mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('signin.tabAccessKey')}</span>
                <span className="sm:hidden">Key</span>
              </button>
            </div>
          </div>

          {/* Login Forms */}
          <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 lg:px-10 shadow-lg sm:rounded-b-lg border border-gray-200">
            {mode === 'credentials' ? (
              <form onSubmit={handleCredentialLogin} className="space-y-5 sm:space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('signin.email')}
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2.5 sm:py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm"
                    />
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 sm:top-2.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('signin.password')}
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2.5 sm:py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm"
                    />
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 sm:top-2.5" />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 sm:py-2.5 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        {t('common.loading')}
                      </>
                    ) : (
                      t('signin.submit')
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAccessKeyLogin} className="space-y-5 sm:space-y-6">
                <div>
                  <label htmlFor="accessKey" className="block text-sm font-medium text-gray-700">
                    {t('accessKey.title')}
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="accessKey"
                      name="accessKey"
                      type="text"
                      required
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                      className="appearance-none block w-full px-3 py-2.5 sm:py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm uppercase font-mono tracking-wider"
                      placeholder="ACME2024"
                      maxLength={20}
                    />
                    <Key className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 sm:top-2.5" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {t('accessKey.description')}
                  </p>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {t('common.name')} <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-base sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Helps identify your responses (not required)
                  </p>
                </div>

                {error && (
                  <div className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 sm:py-2.5 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        {t('common.loading')}
                      </>
                    ) : (
                      t('accessKey.submit')
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Back to home */}
          <div className="mt-5 sm:mt-6 text-center">
            <Link href="/" className="text-sm sm:text-base text-teal-700 hover:text-teal-800 font-medium inline-block">
              ← {t('signin.backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
