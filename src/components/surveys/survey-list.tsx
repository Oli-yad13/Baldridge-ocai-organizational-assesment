import Link from 'next/link'
import { Calendar, Users, BarChart3, MoreVertical } from 'lucide-react'

interface SurveyListProps {
  surveys: Array<{
    id: string
    title: string
    status: string
    createdAt: Date
    openAt: Date | null
    closeAt: Date | null
    _count: {
      responses: number
    }
  }>
  userRole?: string
}

export function SurveyList({ surveys, userRole }: SurveyListProps) {
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

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set'
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {surveys.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No surveys</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new assessment.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {surveys.map((survey) => (
            <li key={survey.id}>
              <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {survey.title}
                      </p>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          survey.status
                        )}`}
                      >
                        {survey.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                      <span>Created {formatDate(survey.createdAt)}</span>
                      {survey.openAt && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Opens {formatDate(survey.openAt)}</span>
                        </>
                      )}
                      {survey.closeAt && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Closes {formatDate(survey.closeAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <span>{survey._count.responses} responses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {survey.status === 'OPEN' && (
                      <Link
                        href={`/surveys/${survey.id}/respond`}
                        className="bg-teal-700 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-teal-800"
                      >
                        Take Assessment
                      </Link>
                    )}
                    <Link
                      href={`/surveys/${survey.id}`}
                      className="text-teal-700 hover:text-teal-800 text-sm font-medium"
                    >
                      View
                    </Link>
                    <button className="text-gray-400 hover:text-gray-500">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
