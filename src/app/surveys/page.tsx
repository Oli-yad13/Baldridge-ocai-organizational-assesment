import { prisma } from '@/lib/prisma'

export default async function SurveysPage() {
  // For demo purposes, get all surveys
  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { responses: true },
      },
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assessment Surveys</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Participate in organizational assessments powered by Tenadam
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => (
              <div key={survey.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {survey.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Status: <span className={`font-medium ${
                    survey.status === 'OPEN' ? 'text-emerald-600' : 
                    survey.status === 'DRAFT' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {survey.status}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Responses: {survey._count.responses}
                </p>
                {survey.status === 'OPEN' && (
                  <a
                    href={`/surveys/${survey.id}/respond`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Take Assessment
                  </a>
                )}
              </div>
            ))}
          </div>
          
          {surveys.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No surveys available at the moment.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
