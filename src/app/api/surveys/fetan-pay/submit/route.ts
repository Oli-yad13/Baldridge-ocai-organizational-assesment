import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { respondentType, data, isCompleted } = body

        if (!respondentType || !data) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const response = await prisma.fetanPayResponse.create({
            data: {
                respondentType,
                data,
                isCompleted: isCompleted || false,
            },
        })

        return NextResponse.json({ success: true, id: response.id })
    } catch (error) {
        console.error('Error submitting Fetan Pay survey:', error)
        return NextResponse.json(
            { error: 'Failed to submit survey' },
            { status: 500 }
        )
    }
}
