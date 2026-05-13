import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: responseId } = await params
    const userId = request.headers.get('X-User-Id')

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verify facilitator has access to this survey type
        const survey = await prisma.featuredSurvey.findFirst({
            where: { facilitatorId: userId, assessmentType: 'FETAN_PAY' },
        })

        if (!survey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const response = await prisma.fetanPayResponse.findUnique({
            where: { id: responseId },
        })

        if (!response) {
            return NextResponse.json({ error: 'Response not found' }, { status: 404 })
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error fetching response:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
