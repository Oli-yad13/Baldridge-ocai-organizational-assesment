import { PrismaClient, Role, AssessmentType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { FETAN_PAY_CONTENT } from '../src/lib/fetan-pay-content'
import { SANKOFA_CONTENT } from '../src/lib/sankofa-content'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting seed...')

    // 1. Create Facilitator Accounts
    const facilitators = [
        {
            name: 'Fetan Pay Facilitator',
            email: 'fetanpay@facilitator.com',
            password: 'FetanPay@2024!',
            role: Role.FACILITATOR,
        },
        {
            name: 'CSankofa Facilitator',
            email: 'sankofa@facilitator.com',
            password: 'Sankofa@2024!',
            role: Role.FACILITATOR,
        },
    ]

    for (const fac of facilitators) {
        const hashedPassword = await bcrypt.hash(fac.password, 10)
        const user = await prisma.user.upsert({
            where: { email: fac.email },
            update: {
                password: hashedPassword, // Update password if user exists
            },
            create: {
                name: fac.name,
                email: fac.email,
                password: hashedPassword,
                role: fac.role,
            },
        })
        console.log(`Facilitator created/updated: ${user.email}`)
    }

    // 2. Seed Featured Surveys
    const fetanPayFacilitator = await prisma.user.findUnique({ where: { email: 'fetanpay@facilitator.com' } })
    const sankofaFacilitator = await prisma.user.findUnique({ where: { email: 'sankofa@facilitator.com' } })

    // Fetan Pay
    await prisma.featuredSurvey.upsert({
        where: { assessmentType: AssessmentType.FETAN_PAY },
        update: {
            content: FETAN_PAY_CONTENT, // Use the imported content
            facilitatorId: fetanPayFacilitator?.id
        },
        create: {
            assessmentType: AssessmentType.FETAN_PAY,
            title: 'Fetan Pay Ecosystem Assessment',
            description: 'A comprehensive assessment for the Fetan Pay ecosystem.',
            content: FETAN_PAY_CONTENT,
            isActive: true,
            facilitatorId: fetanPayFacilitator?.id,
        },
    })
    console.log('Fetan Pay survey seeded.')

    // Sankofa - using full content from sankofa-content.ts
    await prisma.featuredSurvey.upsert({
        where: { assessmentType: AssessmentType.SANKOFA },
        update: {
            title: 'CSankofa CSO Assessment',
            content: SANKOFA_CONTENT,
            facilitatorId: sankofaFacilitator?.id
        },
        create: {
            assessmentType: AssessmentType.SANKOFA,
            title: 'CSankofa CSO Assessment',
            description: 'Let us understand about your Civil Society Organization more.',
            content: SANKOFA_CONTENT,
            isActive: true,
            facilitatorId: sankofaFacilitator?.id,
        },
    })
    console.log('Sankofa survey seeded.')

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
