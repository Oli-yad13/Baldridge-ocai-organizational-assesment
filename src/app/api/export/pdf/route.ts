import { NextRequest, NextResponse } from 'next/server'
import { PDFExportService } from '@/lib/pdf-export'
import { AggregationService } from '@/lib/aggregation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { surveyId, organizationName, surveyTitle, methodology, notes } = body

    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required' },
        { status: 400 }
      )
    }

    // Get aggregates data
    const aggregates = await AggregationService.getAggregates(surveyId)
    
    // Mock participation stats (in real app, get from database)
    const participationStats = {
      totalInvited: 100,
      totalResponded: aggregates.find(agg => agg.sliceKey === 'whole_org')?.n || 0,
      participationRate: 0.75
    }

    // Generate PDF
    const pdfBlob = await PDFExportService.generateOrgReport({
      organizationName: organizationName || 'Organization',
      surveyTitle: surveyTitle || 'Culture Assessment',
      aggregates,
      participationStats,
      methodology: methodology || 'Standard OCAI methodology',
      notes
    })

    // Convert blob to buffer
    const buffer = await pdfBlob.arrayBuffer()
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="culture-assessment-report-${surveyId}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    )
  }
}
