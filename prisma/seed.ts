import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Acme Corporation',
      industry: 'Technology',
      size: '100-500 employees',
      country: 'United States',
      settings: {
        theme: 'default',
        timezone: 'America/New_York',
      },
    },
  })

  console.log('✅ Created organization:', organization.name)

  // Create sample users
  const hashedPassword = await bcrypt.hash('Tenadamhub@#13ab', 10)

  const systemAdmin = await prisma.user.upsert({
    where: { email: 'admin@tenadam.com' },
    update: {
      password: hashedPassword,
      role: 'SYSTEM_ADMIN',
    },
    create: {
      name: 'System Admin',
      email: 'admin@tenadam.com',
      password: hashedPassword,
      role: 'SYSTEM_ADMIN',
    },
  })

  const facilitatorUser = await prisma.user.upsert({
    where: { email: 'facilitator@acme.com' },
    update: {
      password: hashedPassword,
      role: 'FACILITATOR',
      organizationId: organization.id,
    },
    create: {
      name: 'Facilitator User',
      email: 'facilitator@acme.com',
      password: hashedPassword,
      role: 'FACILITATOR',
      organizationId: organization.id,
    },
  })

  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@acme.com' },
    update: {
      role: 'EMPLOYEE',
      organizationId: organization.id,
    },
    create: {
      name: 'Employee User',
      email: 'employee@acme.com',
      role: 'EMPLOYEE',
      organizationId: organization.id,
    },
  })

  console.log('✅ Created users:', [systemAdmin, facilitatorUser, employeeUser].map(u => u.name))

  // Create sample survey
  const survey = await prisma.survey.create({
    data: {
      title: 'Q1 2024 Culture Assessment',
      status: 'OPEN',
      organizationId: organization.id,
      openAt: new Date(),
      closeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      allowAnonymous: true,
      requireOrgEmailDomain: false,
    },
  })

  console.log('✅ Created survey:', survey.title)

  // Create sample responses
  const sampleResponses = [
    {
      nowScores: { clan: 30, adhocracy: 20, market: 25, hierarchy: 25 },
      preferredScores: { clan: 35, adhocracy: 25, market: 20, hierarchy: 20 },
      demographics: { department: 'Engineering', role: 'Developer', experience: '3-5 years' },
    },
    {
      nowScores: { clan: 25, adhocracy: 30, market: 30, hierarchy: 15 },
      preferredScores: { clan: 20, adhocracy: 35, market: 25, hierarchy: 20 },
      demographics: { department: 'Product', role: 'Manager', experience: '6-10 years' },
    },
    {
      nowScores: { clan: 20, adhocracy: 15, market: 35, hierarchy: 30 },
      preferredScores: { clan: 25, adhocracy: 20, market: 30, hierarchy: 25 },
      demographics: { department: 'Sales', role: 'Director', experience: '10+ years' },
    },
  ]

  for (const responseData of sampleResponses) {
    await prisma.response.create({
      data: {
        surveyId: survey.id,
        userId: null, // Anonymous responses
        demographics: responseData.demographics,
        nowScores: responseData.nowScores,
        preferredScores: responseData.preferredScores,
        ipHash: 'sample-hash-' + Math.random().toString(36).substr(2, 9),
      },
    })
  }

  console.log('✅ Created sample responses')

  // Create sample aggregate data
  const currentAverages = {
    clan: sampleResponses.reduce((sum, r) => sum + r.nowScores.clan, 0) / sampleResponses.length,
    adhocracy: sampleResponses.reduce((sum, r) => sum + r.nowScores.adhocracy, 0) / sampleResponses.length,
    market: sampleResponses.reduce((sum, r) => sum + r.nowScores.market, 0) / sampleResponses.length,
    hierarchy: sampleResponses.reduce((sum, r) => sum + r.nowScores.hierarchy, 0) / sampleResponses.length,
  }

  const preferredAverages = {
    clan: sampleResponses.reduce((sum, r) => sum + r.preferredScores.clan, 0) / sampleResponses.length,
    adhocracy: sampleResponses.reduce((sum, r) => sum + r.preferredScores.adhocracy, 0) / sampleResponses.length,
    market: sampleResponses.reduce((sum, r) => sum + r.preferredScores.market, 0) / sampleResponses.length,
    hierarchy: sampleResponses.reduce((sum, r) => sum + r.preferredScores.hierarchy, 0) / sampleResponses.length,
  }

  await prisma.aggregate.create({
    data: {
      surveyId: survey.id,
      sliceKey: 'overall',
      sliceLabel: 'Overall Organization',
      currentClan: currentAverages.clan,
      currentAdhocracy: currentAverages.adhocracy,
      currentMarket: currentAverages.market,
      currentHierarchy: currentAverages.hierarchy,
      preferredClan: preferredAverages.clan,
      preferredAdhocracy: preferredAverages.adhocracy,
      preferredMarket: preferredAverages.market,
      preferredHierarchy: preferredAverages.hierarchy,
      delta: {
        clan: preferredAverages.clan - currentAverages.clan,
        adhocracy: preferredAverages.adhocracy - currentAverages.adhocracy,
        market: preferredAverages.market - currentAverages.market,
        hierarchy: preferredAverages.hierarchy - currentAverages.hierarchy,
      },
      n: sampleResponses.length,
    },
  })

  console.log('✅ Created aggregate data')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
