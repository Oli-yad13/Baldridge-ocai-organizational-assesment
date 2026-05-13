import { NextResponse } from 'next/server'
import { prisma, ensurePrismaConnected } from '@/lib/prisma'

// GET: List active featured surveys (public endpoint)
export async function GET() {
    // Return immediately with timeout - don't block the request
    try {
        // Use a very short timeout to prevent hanging
        const queryPromise = (async () => {
            try {
                await Promise.race([
                    ensurePrismaConnected(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2000))
                ])
                
                return await Promise.race([
                    prisma.featuredSurvey.findMany({
                        where: { isActive: true },
                        select: {
                            id: true,
                            assessmentType: true,
                            title: true,
                            description: true,
                            isActive: true,
                        },
                        orderBy: { createdAt: 'asc' }
                    }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 2000))
                ]) as any[]
            } catch (err) {
                console.error('[Featured Surveys API] Error:', err)
                return []
            }
        })()

        // Wait max 3 seconds total, then return empty array
        const surveys = await Promise.race([
            queryPromise,
            new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 3000))
        ])

        return NextResponse.json(surveys)
    } catch (error: any) {
        console.error('[Featured Surveys API] Fatal error:', error?.message || error)
        // Always return empty array to prevent page from breaking
        return NextResponse.json([])
    }
}

