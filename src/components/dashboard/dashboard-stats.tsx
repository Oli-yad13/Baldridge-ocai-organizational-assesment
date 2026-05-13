interface DashboardStatsProps {
  surveys: number
  responses: number
  organization: any
}

export function DashboardStats({ surveys, responses, organization }: DashboardStatsProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Overview
        </h3>
        
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="px-4 py-5 bg-teal-50 rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-teal-700 truncate">
              Total Assessments
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-teal-900">
              {surveys}
            </dd>
          </div>
          
          <div className="px-4 py-5 bg-emerald-50 rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-emerald-700 truncate">
              Total Responses
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-emerald-900">
              {responses}
            </dd>
          </div>
          
          <div className="px-4 py-5 bg-slate-50 rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-slate-700 truncate">
              Response Rate
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-slate-900">
              {surveys > 0 ? Math.round((responses / surveys) * 100) : 0}%
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
