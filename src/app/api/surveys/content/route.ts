import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AssessmentType } from '@prisma/client'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type) {
        return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 })
    }

    try {
        const survey = await prisma.featuredSurvey.findUnique({
            where: { assessmentType: type as AssessmentType },
        })

        if (!survey || !survey.isActive) {
            return NextResponse.json({ error: 'Survey not found or inactive' }, { status: 404 })
        }

        return NextResponse.json(survey.content)
    } catch (error) {
        console.error('Error fetching survey content:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
