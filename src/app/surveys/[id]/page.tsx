import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SurveyResponseForm } from '@/components/surveys/survey-response-form'
import { OCAIRadarChart } from '@/components/charts/ocai-radar-chart'
import { OCAIBarChart } from '@/components/charts/ocai-bar-chart'
import { notFound } from 'next/navigation'

interface SurveyPageProps {
  params: Promise<{ id: string }>
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const session = await getServerSession(authOptions)
  const { id: surveyId } = await params

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      organization: true,
      responses: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!survey) {
    notFound()
  }

  // Check if user has access to this survey
  if (session?.user?.organizationId !== survey.organizationId) {
    return <div>Access denied</div>
  }

  // Calculate aggregate scores
  const currentAverages = survey.responses.length > 0 ? {
    clan: survey.responses.reduce((sum: number, r: any) => sum + r.nowScores.clan, 0) / survey.responses.length,
    adhocracy: survey.responses.reduce((sum: number, r: any) => sum + r.nowScores.adhocracy, 0) / survey.responses.length,
    market: survey.responses.reduce((sum: number, r: any) => sum + r.nowScores.market, 0) / survey.responses.length,
    hierarchy: survey.responses.reduce((sum: number, r: any) => sum + r.nowScores.hierarchy, 0) / survey.responses.length,
  } : { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 }

  const preferredAverages = survey.responses.length > 0 ? {
    clan: survey.responses.reduce((sum: number, r: any) => sum + r.preferredScores.clan, 0) / survey.responses.length,
    adhocracy: survey.responses.reduce((sum: number, r: any) => sum + r.preferredScores.adhocracy, 0) / survey.responses.length,
    market: survey.responses.reduce((sum: number, r: any) => sum + r.preferredScores.market, 0) / survey.responses.length,
    hierarchy: survey.responses.reduce((sum: number, r: any) => sum + r.preferredScores.hierarchy, 0) / survey.responses.length,
  } : { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 }

  return (
    <div className="min-h-full">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Status: {survey.status} • {survey.responses.length} responses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Response Form */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Take the Survey
              </h2>
              <SurveyResponseForm surveyId={surveyId} />
            </div>

            {/* Results Visualization */}
            {survey.responses.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Current Results
                </h2>
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <OCAIRadarChart
                      currentScores={currentAverages}
                      preferredScores={preferredAverages}
                      title="Culture Profile"
                    />
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <OCAIBarChart
                      currentScores={currentAverages}
                      preferredScores={preferredAverages}
                      title="Culture Comparison"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
