import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test organization and user...');

  // Create test organization
  const org = await prisma.organization.upsert({
    where: { id: 'test-org-1' },
    update: {},
    create: {
      id: 'test-org-1',
      name: 'Test Organization',
      industry: 'Technology',
      size: '50-100',
      subscribedAssessments: 'OCAI,BALDRIGE',
      isActive: true,
    },
  });

  console.log('✓ Organization created:', org.name);

  // Create test system admin user
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      name: 'Test Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'SYSTEM_ADMIN',
      organizationId: null, // System admin has no organization
    },
  });

  console.log('✓ System Admin created:', user.email);

  // Create test facilitator user
  const facilitator = await prisma.user.upsert({
    where: { email: 'facilitator@test.com' },
    update: {},
    create: {
      name: 'Test Facilitator',
      email: 'facilitator@test.com',
      password: hashedPassword,
      role: 'FACILITATOR',
      organizationId: org.id,
    },
  });

  console.log('✓ Facilitator created:', facilitator.email);

  // Create test employee user
  const employee = await prisma.user.upsert({
    where: { id: 'test-employee-1' },
    update: {},
    create: {
      id: 'test-employee-1',
      name: 'Test Employee',
      email: 'employee@test.com',
      role: 'EMPLOYEE',
      organizationId: org.id,
    },
  });

  console.log('✓ Employee created:', employee.email);

  // Create test access key
  const accessKey = await prisma.accessKey.upsert({
    where: { key: 'TEST123' },
    update: {},
    create: {
      key: 'TEST123',
      organizationId: org.id,
      assessmentTypes: 'OCAI,BALDRIGE',
      isActive: true,
      description: 'Test access key for development',
    },
  });

  console.log('✓ Access Key created:', accessKey.key);

  console.log('\n=== Test Data Created Successfully ===');
  console.log('System Admin Login:');
  console.log('  Email: admin@test.com');
  console.log('  Password: password123');
  console.log('');
  console.log('Facilitator Login:');
  console.log('  Email: facilitator@test.com');
  console.log('  Password: password123');
  console.log('');
  console.log('Access Key: TEST123');
  console.log('=======================================\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
