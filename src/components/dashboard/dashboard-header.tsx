'use client'

import { signOut } from 'next-auth/react'
import { User, LogOut, Settings } from 'lucide-react'

interface DashboardHeaderProps {
  user: any
  organization: any
}

export function DashboardHeader({ user, organization }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <img
                src="/tenadam-logo.png"
                alt="Tenadam Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-900">Assessment Hub</h1>
            </div>
            {organization && (
              <div className="ml-6">
                <div className="text-sm text-gray-500">Organization</div>
                <div className="text-lg font-medium text-gray-900">
                  {organization.name}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {user.name}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                {user.role.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-500"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                type="button"
                onClick={() => signOut()}
                className="p-2 text-gray-400 hover:text-gray-500"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
