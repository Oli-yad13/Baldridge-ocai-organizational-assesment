import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Tenadam Assessment Hub...')

  // Create system admin
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const systemAdmin = await prisma.user.upsert({
    where: { email: 'admin@tenadam.com' },
    update: {},
    create: {
      name: 'Tenadam System Admin',
      email: 'admin@tenadam.com',
      password: hashedPassword,
      role: 'SYSTEM_ADMIN',
      organizationId: null,
    },
  })

  console.log('✅ Created system admin:', systemAdmin.email)

  // Create a demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { id: 'demo-org-001' },
    update: {},
    create: {
      id: 'demo-org-001',
      name: 'Acme Corporation',
      industry: 'Technology',
      size: '100-500 employees',
      country: 'United States',
      subscribedAssessments: 'OCAI,BALDRIGE',
      isActive: true,
      createdById: systemAdmin.id,
    },
  })

  console.log('✅ Created demo organization:', demoOrg.name)

  // Create a facilitator for demo org
  const facilitatorPassword = await bcrypt.hash('facilitator123', 10)
  const facilitator = await prisma.user.upsert({
    where: { email: 'facilitator@acme.com' },
    update: {},
    create: {
      name: 'John Facilitator',
      email: 'facilitator@acme.com',
      password: facilitatorPassword,
      role: 'FACILITATOR',
      organizationId: demoOrg.id,
    },
  })

  console.log('✅ Created facilitator:', facilitator.email)

  // Create access keys for demo org
  const accessKey1 = await prisma.accessKey.create({
    data: {
      key: 'ACME2024',
      organizationId: demoOrg.id,
      assessmentTypes: 'OCAI,BALDRIGE',
      description: 'Q1 2024 All Assessments',
      createdBy: systemAdmin.id,
      isActive: true,
    },
  })

  const accessKey2 = await prisma.accessKey.create({
    data: {
      key: 'OCAI001',
      organizationId: demoOrg.id,
      assessmentTypes: 'OCAI',
      description: 'OCAI Only - Leadership Team',
      createdBy: facilitator.id,
      isActive: true,
      maxUses: 50,
    },
  })

  console.log('✅ Created access keys:', [accessKey1.key, accessKey2.key])

  // Create a sample OCAI survey
  const ocaiSurvey = await prisma.survey.create({
    data: {
      title: 'Q1 2024 Culture Assessment',
      organizationId: demoOrg.id,
      assessmentType: 'OCAI',
      status: 'OPEN',
      openAt: new Date(),
      closeAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      allowAnonymous: true,
    },
  })

  console.log('✅ Created OCAI survey:', ocaiSurvey.title)

  console.log('\n🎉 Seeding completed!')
  console.log('\n📋 Login Credentials:')
  console.log('━'.repeat(50))
  console.log('System Admin:')
  console.log('  Email: admin@tenadam.com')
  console.log('  Password: admin123')
  console.log('\nFacilitator (Acme Corp):')
  console.log('  Email: facilitator@acme.com')
  console.log('  Password: facilitator123')
  console.log('\nEmployee Access Keys:')
  console.log('  ACME2024 - Full access (OCAI + Baldrige)')
  console.log('  OCAI001 - OCAI only (max 50 uses)')
  console.log('━'.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
