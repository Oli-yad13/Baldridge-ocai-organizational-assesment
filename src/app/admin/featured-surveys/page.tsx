'use client'

import FeaturedSurveysAdmin from '@/components/admin/FeaturedSurveysAdmin'
import Link from 'next/link'
import { Shield, LogOut } from 'lucide-react'
import LanguageSwitcher from '@/components/localization/LanguageSwitcher'
import { useLocale } from '@/lib/i18n/context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function FeaturedSurveysPage() {
    const { t } = useLocale()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
            router.push('/auth/signin')
            return
        }
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.role !== 'SYSTEM_ADMIN') {
            router.push('/')
            return
        }
        setUser(parsedUser)
    }, [router])

    const handleSignOut = () => {
        localStorage.removeItem('user')
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{t('common.systemAdministration')}</h1>
                                <p className="text-sm text-gray-600">{t('common.tenadamAssessmentHub')}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{user?.name}</span>
                            <LanguageSwitcher />
                            <button
                                onClick={handleSignOut}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('nav.signOut')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 overflow-x-auto">
                        <Link href="/admin/dashboard" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                            {t('nav.dashboard')}
                        </Link>
                        <Link href="/admin/organizations" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                            {t('nav.organizations')}
                        </Link>
                        <Link href="/admin/access-keys" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                            {t('nav.accessKeys')}
                        </Link>
                        <Link href="/admin/assessment-credentials" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                            {t('nav.credentials')}
                        </Link>
                        <Link href="/admin/users" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                            {t('nav.users')}
                        </Link>
                        <Link href="/admin/ocai" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                            {t('nav.ocai')}
                        </Link>
                        <Link href="/admin/baldrige" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                            {t('nav.baldrige')}
                        </Link>
                        <Link href="/admin/surveys" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                            {t('nav.surveys')}
                        </Link>
                        <Link href="/admin/featured-surveys" className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">
                            Featured Surveys
                        </Link>
                        <Link href="/admin/settings" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                            {t('nav.settings')}
                        </Link>
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <FeaturedSurveysAdmin />
            </main>
        </div>
    )
}
