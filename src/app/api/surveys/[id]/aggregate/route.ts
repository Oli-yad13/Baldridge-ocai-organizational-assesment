import { NextRequest, NextResponse } from 'next/server'
import { AggregationService } from '@/lib/aggregation'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Trigger background aggregation
    await AggregationService.computeAggregates(id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Aggregation completed successfully' 
    })
  } catch (error) {
    console.error('Aggregation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to compute aggregates' 
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const aggregates = await AggregationService.getAggregates(id)
    
    return NextResponse.json({ aggregates })
  } catch (error) {
    console.error('Error fetching aggregates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch aggregates' },
      { status: 500 }
    )
  }
}
