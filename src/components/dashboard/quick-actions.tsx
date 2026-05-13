import Link from 'next/link'
import { Plus, Users, BarChart3, FileText } from 'lucide-react'

interface QuickActionsProps {
  userRole: string
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const actions = [
    {
      name: 'Create Assessment',
      href: '/surveys/new',
      icon: Plus,
      description: 'Start a new assessment',
      available: ['ORG_ADMIN', 'FACILITATOR'].includes(userRole),
    },
    {
      name: 'View Reports',
      href: '/reports',
      icon: BarChart3,
      description: 'Analyze survey results',
      available: ['ORG_ADMIN', 'FACILITATOR'].includes(userRole),
    },
    {
      name: 'Manage Users',
      href: '/users',
      icon: Users,
      description: 'Invite and manage team members',
      available: userRole === 'ORG_ADMIN',
    },
    {
      name: 'Export Data',
      href: '/export',
      icon: FileText,
      description: 'Download survey data',
      available: ['ORG_ADMIN', 'FACILITATOR'].includes(userRole),
    },
  ]

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.name}
                href={action.available ? action.href : '#'}
                className={`block p-4 rounded-lg border transition-colors ${
                  action.available
                    ? 'border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {action.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
