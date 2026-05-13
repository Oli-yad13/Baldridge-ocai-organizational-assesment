import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst({ where: { email: 'facilitator@acme.com' } })
    if (!user) {
        console.log('Facilitator not found')
        return
    }
    const surveys = await prisma.featuredSurvey.findMany({
        where: { facilitatorId: user.id }
    })
    console.log('Surveys for facilitator:', surveys.map(s => ({ id: s.id, type: s.assessmentType, title: s.title })))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
