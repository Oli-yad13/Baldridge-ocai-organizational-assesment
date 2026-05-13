import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const survey = await prisma.featuredSurvey.findUnique({
        where: { assessmentType: 'SANKOFA' }
    })

    console.log('Sankofa Content:', JSON.stringify(survey?.content, null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
