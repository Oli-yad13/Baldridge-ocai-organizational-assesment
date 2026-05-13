import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/get-user-id'

// GET: List all featured surveys
export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const userId = await getUserId(request)

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user || user.role !== 'SYSTEM_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Only admins can manage featured surveys' },
                { status: 403 }
            )
        }

        const surveys = await prisma.featuredSurvey.findMany({
            include: {
                facilitator: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(surveys)
    } catch (error) {
        console.error('Error fetching featured surveys:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST: Approve changes or toggle status
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const userId = await getUserId(request)

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user || user.role !== 'SYSTEM_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Only admins can manage featured surveys' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { id, action, isActive } = body

        if (!id || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (action === 'approve_content') {
            const survey = await prisma.featuredSurvey.findUnique({ where: { id } })
            if (!survey || !survey.pendingContent) {
                return NextResponse.json({ error: 'No pending content to approve' }, { status: 400 })
            }

            await prisma.featuredSurvey.update({
                where: { id },
                data: {
                    content: survey.pendingContent as any,
                    pendingContent: Prisma.DbNull, // Clear pending content
                },
            })
            return NextResponse.json({ success: true, message: 'Content approved and published' })
        }

        if (action === 'toggle_status') {
            await prisma.featuredSurvey.update({
                where: { id },
                data: { isActive },
            })
            return NextResponse.json({ success: true, message: `Survey ${isActive ? 'activated' : 'deactivated'}` })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error('Error managing survey:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE: Delete a featured survey
export async function DELETE(request: NextRequest) {
    try {
        // Check authentication
        const userId = await getUserId(request)

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

        if (!user || user.role !== 'SYSTEM_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Only admins can delete featured surveys' },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 })
        }

        // Check if survey exists
        const survey = await prisma.featuredSurvey.findUnique({ where: { id } })
        if (!survey) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
        }

        // Delete the survey
        await prisma.featuredSurvey.delete({ where: { id } })

        return NextResponse.json({ success: true, message: 'Survey deleted successfully' })
    } catch (error) {
        console.error('Error deleting survey:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
