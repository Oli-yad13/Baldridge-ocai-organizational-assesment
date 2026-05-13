import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRoles() {
  console.log('Fixing ORG_ADMIN roles...');
  
  const result = await prisma.$executeRaw`
    UPDATE users SET role = 'FACILITATOR' WHERE role = 'ORG_ADMIN'
  `;
  
  console.log(`✅ Fixed ${result} users`);
  
  await prisma.$disconnect();
}

fixRoles().catch(console.error);

