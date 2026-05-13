import Link from 'next/link'
import { Calendar, Users, BarChart3 } from 'lucide-react'

interface RecentSurveysProps {
  surveys: Array<{
    id: string
    title: string
    status: string
    createdAt: Date
    _count: {
      responses: number
    }
  }>
  userRole?: string
}

export function RecentSurveys({ surveys, userRole }: RecentSurveysProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-100 text-emerald-800'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800'
      case 'DRAFT':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Surveys
          </h3>
          <Link
            href="/surveys"
            className="text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            View all
          </Link>
        </div>

        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {surveys.length === 0 ? (
              <li className="py-4">
                <div className="text-sm text-gray-500 text-center">
                  No surveys yet. Create your first survey to get started.
                </div>
              </li>
            ) : (
              surveys.map((survey) => (
                <li key={survey.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {survey.title}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {survey._count.responses} responses
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          survey.status
                        )}`}
                      >
                        {survey.status}
                      </span>
                      {survey.status === 'OPEN' && (
                        <Link
                          href={`/surveys/${survey.id}/respond`}
                          className="bg-teal-700 text-white px-2 py-1 rounded text-xs font-medium hover:bg-teal-800"
                        >
                          Take Assessment
                        </Link>
                      )}
                      <Link
                        href={`/surveys/${survey.id}`}
                        className="text-gray-400 hover:text-gray-500"
                        aria-label="View survey"
                      >
                        <BarChart3 className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
