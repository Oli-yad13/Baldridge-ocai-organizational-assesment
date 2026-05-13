import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { respondentType, data, isCompleted } = body

        if (!data) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const response = await prisma.sankofaResponse.create({
            data: {
                respondentType: respondentType || 'CSO',
                data,
                isCompleted: isCompleted || false,
            },
        })

        return NextResponse.json({ success: true, id: response.id })
    } catch (error) {
        console.error('Error submitting Sankofa survey:', error)
        return NextResponse.json(
            { error: 'Failed to submit survey' },
            { status: 500 }
        )
    }
}
