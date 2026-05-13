'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentSurveys } from '@/components/dashboard/recent-surveys'
import { QuickActions } from '@/components/dashboard/quick-actions'

interface User {
  name: string
  role: string
  organizationId: string
}

interface Organization {
  id: string
  name: string
  industry?: string
  size?: string
  country?: string
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user info from URL params (simple auth)
    const userName = searchParams.get('user')
    const userRole = searchParams.get('role')
    const orgId = searchParams.get('orgId')

    if (userName && userRole && orgId) {
      setUser({
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        role: userRole,
        organizationId: orgId,
      })
      
      setOrganization({
        id: orgId,
        name: 'Acme Corporation',
        industry: 'Technology',
        size: '100-500 employees',
        country: 'United States',
      })
    }
    
    setLoading(false)
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to access the dashboard.</p>
          <a
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-700 hover:bg-teal-800"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  // Mock data for demonstration
  const surveys = 3
  const responses = 15
  const recentSurveys = [
    {
      id: '1',
      title: 'Q1 2024 Culture Assessment',
      status: 'OPEN',
      createdAt: new Date('2024-01-15'),
      _count: { responses: 8 }
    },
    {
      id: '2',
      title: 'Team Feedback Survey',
      status: 'CLOSED',
      createdAt: new Date('2024-01-10'),
      _count: { responses: 5 }
    },
    {
      id: '3',
      title: 'Leadership Assessment',
      status: 'DRAFT',
      createdAt: new Date('2024-01-05'),
      _count: { responses: 2 }
    }
  ]

  return (
    <div className="min-h-full">
      <DashboardHeader user={user} organization={organization} />
      
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your organization's assessment progress.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardStats
                surveys={surveys}
                responses={responses}
                organization={organization}
              />
              <RecentSurveys surveys={recentSurveys} userRole={user.role} />
            </div>
            
            <div className="lg:col-span-1">
              <QuickActions userRole={user.role} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}