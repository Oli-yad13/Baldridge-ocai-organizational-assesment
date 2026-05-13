import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// OCAI dimensions for generating realistic responses
const OCAI_DIMENSIONS = [
  'Dominant Characteristics',
  'Leadership',
  'Management of Employees', 
  'Organization Glue',
  'Strategic Emphases',
  'Criteria of Success'
]

// Generate realistic OCAI scores with pattern: higher Control 'Now', higher Collaborate 'Preferred'
function generateOCAIResponse(): { now: any; preferred: any } {
  // Current culture: higher Control, lower Collaborate
  const nowScores = {
    Clan: faker.number.int({ min: 10, max: 25 }), // Lower collaboration
    Adhocracy: faker.number.int({ min: 15, max: 30 }),
    Market: faker.number.int({ min: 20, max: 35 }),
    Hierarchy: faker.number.int({ min: 25, max: 40 }) // Higher control
  }
  
  // Preferred culture: higher Collaborate, lower Control
  const preferredScores = {
    Clan: faker.number.int({ min: 25, max: 40 }), // Higher collaboration
    Adhocracy: faker.number.int({ min: 20, max: 35 }),
    Market: faker.number.int({ min: 15, max: 30 }),
    Hierarchy: faker.number.int({ min: 10, max: 25 }) // Lower control
  }

  // Normalize to ensure they sum to 100
  const normalizeScores = (scores: any) => {
    const total = Object.values(scores).reduce((sum: number, val: any) => sum + (val as number), 0)
    const factor = 100 / total
    return Object.fromEntries(
      Object.entries(scores).map(([key, value]) => [key, Math.round((value as number) * factor)])
    )
  }

  return {
    now: normalizeScores(nowScores),
    preferred: normalizeScores(preferredScores)
  }
}

// Generate detailed OCAI responses for each dimension
function generateDetailedOCAIResponse(): { nowScores: any; preferredScores: any } {
  const nowScores: any = {}
  const preferredScores: any = {}
  
  OCAI_DIMENSIONS.forEach((dimension, index) => {
    const dimensionKey = dimension.toLowerCase().replace(/\s+/g, '_')
    
    // Generate A, B, C, D scores that sum to 100
    const nowA = faker.number.int({ min: 15, max: 35 })
    const nowB = faker.number.int({ min: 15, max: 35 })
    const nowC = faker.number.int({ min: 15, max: 35 })
    const nowD = 100 - nowA - nowB - nowC
    
    const preferredA = faker.number.int({ min: 20, max: 40 }) // Higher A (Clan)
    const preferredB = faker.number.int({ min: 15, max: 35 })
    const preferredC = faker.number.int({ min: 15, max: 35 })
    const preferredD = 100 - preferredA - preferredB - preferredC
    
    nowScores[dimensionKey] = { A: nowA, B: nowB, C: nowC, D: nowD }
    preferredScores[dimensionKey] = { A: preferredA, B: preferredB, C: preferredC, D: preferredD }
  })
  
  return { nowScores, preferredScores }
}

// Generate demographics
function generateDemographics(department: string): any {
  const tenureOptions = ['less-than-1', '1-2', '3-5', '6-10', 'more-than-10']
  const genderOptions = ['male', 'female', 'non-binary', 'prefer-not-to-say']
  const raceOptions = ['white', 'black', 'hispanic', 'asian', 'native-american', 'pacific-islander', 'two-or-more', 'prefer-not-to-say']
  const locationOptions = ['New York', 'San Francisco', 'Chicago', 'Austin', 'Seattle', 'Remote', 'Boston', 'Los Angeles']
  
  return {
    department,
    team: faker.helpers.arrayElement(['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'HR']),
    tenure: faker.helpers.arrayElement(tenureOptions),
    location: faker.helpers.arrayElement(locationOptions),
    gender: faker.helpers.arrayElement(genderOptions),
    laborUnit: faker.helpers.arrayElement(['Individual Contributor', 'Management', 'Leadership', 'Support/Admin']),
    raceEthnicity: faker.helpers.arrayElement(raceOptions)
  }
}

// Generate IP hash (simplified)
function generateIPHash(): string {
  const ip = faker.internet.ip()
  // In production, this would be properly hashed with salt
  return Buffer.from(ip).toString('base64')
}

async function seedDemoData() {
  console.log('🌱 Seeding demo data...')

  // Create demo organization
  const organization = await prisma.organization.create({
    data: {
      name: 'TechCorp Solutions',
      industry: 'Technology',
      size: '500-1000',
      country: 'United States',
      logoUrl: 'https://via.placeholder.com/200x100/3B82F6/FFFFFF?text=TechCorp',
      primaryColor: '#3B82F6',
      dataRetentionDays: 2555, // 7 years
      privacyPolicyUrl: 'https://techcorp.com/privacy',
      consentVersion: '1.0',
      settings: {
        allowAnonymous: true,
        requireConsent: true,
        kAnonymityThreshold: 7
      }
    }
  })

  console.log('✅ Created organization:', organization.name)

  // Create demo users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        role: 'FACILITATOR',
        organizationId: organization.id
      }
    }),
    prisma.user.create({
      data: {
        name: 'Mike Chen',
        email: 'mike.chen@techcorp.com',
        role: 'FACILITATOR',
        organizationId: organization.id
      }
    }),
    prisma.user.create({
      data: {
        name: 'Alex Rodriguez',
        email: 'alex.rodriguez@techcorp.com',
        role: 'EMPLOYEE',
        organizationId: organization.id
      }
    })
  ])

  console.log('✅ Created users:', users.length)

  // Create demo survey
  const survey = await prisma.survey.create({
    data: {
      organizationId: organization.id,
      title: 'Q4 2024 Culture Assessment',
      status: 'OPEN',
      openAt: new Date('2024-10-01'),
      closeAt: new Date('2024-12-31'),
      allowAnonymous: true,
      requireOrgEmailDomain: true
    }
  })

  console.log('✅ Created survey:', survey.title)

  // Generate 120 synthetic responses across 3 departments
  const departments = ['Engineering', 'Product', 'Sales']
  const responses = []

  for (let i = 0; i < 120; i++) {
    const department = faker.helpers.arrayElement(departments)
    const demographics = generateDemographics(department)
    const { nowScores, preferredScores } = generateDetailedOCAIResponse()
    
    // 20% anonymous responses
    const isAnonymous = faker.datatype.boolean({ probability: 0.2 })
    
    const response = await prisma.response.create({
      data: {
        surveyId: survey.id,
        userId: isAnonymous ? null : faker.helpers.arrayElement(users).id,
        demographics,
        nowScores,
        preferredScores,
        submittedAt: faker.date.between({ 
          from: new Date('2024-10-01'), 
          to: new Date() 
        }),
        ipHash: generateIPHash(),
        consentGiven: true,
        consentTimestamp: faker.date.between({ 
          from: new Date('2024-10-01'), 
          to: new Date() 
        }),
        consentVersion: '1.0',
        anonymousMode: isAnonymous
      }
    })
    
    responses.push(response)
  }

  console.log('✅ Created responses:', responses.length)

  // Create some comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        surveyId: survey.id,
        responseId: responses[0].id,
        text: 'Great initiative! Looking forward to seeing the results.'
      }
    }),
    prisma.comment.create({
      data: {
        surveyId: survey.id,
        responseId: responses[1].id,
        text: 'The current hierarchy feels too rigid. Would love more flexibility.'
      }
    }),
    prisma.comment.create({
      data: {
        surveyId: survey.id,
        responseId: responses[2].id,
        text: 'We need better collaboration tools and processes.'
      }
    })
  ])

  console.log('✅ Created comments:', comments.length)

  // Create some workshops
  const workshop = await prisma.workshop.create({
    data: {
      surveyId: survey.id,
      title: 'Culture Change Planning Workshop',
      description: 'Workshop to discuss survey results and plan culture change initiatives',
      status: 'draft',
      facilitatorId: users[1].id, // Mike Chen as facilitator
      scheduledAt: new Date('2024-12-15')
    }
  })

  // Create workshop session
  const session = await prisma.workshopSession.create({
    data: {
      workshopId: workshop.id,
      title: 'Results Review Session',
      description: 'Review survey results and identify key themes',
      status: 'planned'
    }
  })

  // Create some themes
  const themes = await Promise.all([
    prisma.theme.create({
      data: {
        sessionId: session.id,
        title: 'Need for More Collaboration',
        description: 'Multiple responses indicate desire for increased teamwork and cross-functional collaboration',
        category: 'opportunity',
        priority: 'high'
      }
    }),
    prisma.theme.create({
      data: {
        sessionId: session.id,
        title: 'Reduce Bureaucracy',
        description: 'Strong preference for less hierarchical control and more autonomy',
        category: 'challenge',
        priority: 'high'
      }
    })
  ])

  // Create some actions
  const actions = await Promise.all([
    prisma.action.create({
      data: {
        workshopId: workshop.id,
        sessionId: session.id,
        themeId: themes[0].id,
        title: 'Implement Cross-Functional Teams',
        description: 'Create 3 pilot cross-functional teams to increase collaboration',
        owner: 'Sarah Johnson',
        status: 'planned',
        priority: 'high',
        dueDate: new Date('2025-02-01'),
        successMetrics: {
          teamFormation: '3 teams created',
          participation: '80% employee participation',
          satisfaction: '4.0+ team satisfaction score'
        }
      }
    }),
    prisma.action.create({
      data: {
        workshopId: workshop.id,
        sessionId: session.id,
        themeId: themes[1].id,
        title: 'Streamline Approval Processes',
        description: 'Reduce approval layers and simplify decision-making processes',
        owner: 'Mike Chen',
        status: 'planned',
        priority: 'medium',
        dueDate: new Date('2025-01-15'),
        successMetrics: {
          processTime: '50% reduction in approval time',
          satisfaction: '4.0+ process satisfaction score'
        }
      }
    })
  ])

  console.log('✅ Created workshop with themes and actions')

  // Create some interventions
  const interventions = await Promise.all([
    prisma.intervention.create({
      data: {
        name: 'Peer Learning Circles',
        description: 'Establish small groups for knowledge sharing and collaborative problem-solving',
        category: 'collaborate',
        quadrant: 'clan',
        direction: 'increase',
        effort: 'medium',
        impact: 'high',
        duration: '1-3 months',
        resources: 'Facilitator, meeting space, materials',
        examples: ['Monthly cross-functional learning sessions', 'Peer mentoring programs']
      }
    }),
    prisma.intervention.create({
      data: {
        name: 'Policy Simplification',
        description: 'Streamline and reduce bureaucratic policies and procedures',
        category: 'control',
        quadrant: 'hierarchy',
        direction: 'decrease',
        effort: 'high',
        impact: 'high',
        duration: '3-6 months',
        resources: 'Policy review team, legal consultation',
        examples: ['Policy audit and reduction', 'Simplified approval processes']
      }
    })
  ])

  console.log('✅ Created interventions:', interventions.length)

  console.log('🎉 Demo data seeding completed!')
  console.log(`📊 Organization: ${organization.name}`)
  console.log(`👥 Users: ${users.length}`)
  console.log(`📋 Survey: ${survey.title}`)
  console.log(`📝 Responses: ${responses.length}`)
  console.log(`💬 Comments: ${comments.length}`)
  console.log(`🎯 Workshop: ${workshop.title}`)
  console.log(`🔧 Interventions: ${interventions.length}`)
}

async function main() {
  try {
    await seedDemoData()
  } catch (error) {
    console.error('❌ Error seeding demo data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
