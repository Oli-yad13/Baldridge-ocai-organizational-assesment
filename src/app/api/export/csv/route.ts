import { NextRequest, NextResponse } from 'next/server'
import { CSVExportService } from '@/lib/csv-export'
import { AggregationService } from '@/lib/aggregation'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { surveyId, organizationName, surveyTitle, exportType = 'responses' } = body

    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      )
    }

    // Get aggregates data
    const aggregates = await AggregationService.getAggregates(surveyId)
    
    // Get responses data
    const responses = await prisma.response.findMany({
      where: { surveyId },
      select: {
        id: true,
        demographics: true,
        nowScores: true,
        preferredScores: true,
        submittedAt: true
      }
    })

    let csvBlob: Blob

    if (exportType === 'responses') {
      csvBlob = await CSVExportService.generateDeidentifiedCSV({
        aggregates,
        responses,
        organizationName: organizationName || 'Organization',
        surveyTitle: surveyTitle || 'Culture Assessment'
      })
    } else {
      csvBlob = await CSVExportService.generateAggregatesCSV({
        aggregates,
        responses,
        organizationName: organizationName || 'Organization',
        surveyTitle: surveyTitle || 'Culture Assessment'
      })
    }

    // Convert blob to buffer
    const buffer = await csvBlob.arrayBuffer()
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="culture-assessment-${exportType}-${surveyId}.csv"`
      }
    })
  } catch (error) {
    console.error('Error generating CSV:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSV export' },
      { status: 500 }
    )
  }
}
