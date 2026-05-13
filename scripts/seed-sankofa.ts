import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding Sankofa survey...')

    // Find facilitator
    const facilitator = await prisma.user.findFirst({
        where: { email: 'facilitator@acme.com' }
    })

    if (!facilitator) {
        console.error('❌ Facilitator not found. Please run prisma/seed.ts first.')
        process.exit(1)
    }

    // Create or update Sankofa survey
    const survey = await prisma.featuredSurvey.upsert({
        where: { assessmentType: 'SANKOFA' },
        update: {},
        create: {
            title: 'Sankofa CSO Assessment',
            assessmentType: 'SANKOFA',
            isActive: true,
            facilitatorId: facilitator.id,
            content: {} // Content is loaded dynamically from file/API, but we can store it here if needed. 
            // For now, leaving empty as the API falls back to static content.
        }
    })

    console.log('✅ Sankofa survey seeded:', survey.title)
}

main()
    .catch((e) => {
        console.error('❌ Error seeding Sankofa:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
