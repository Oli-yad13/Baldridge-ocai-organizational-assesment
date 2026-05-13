import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function openSurvey() {
  const surveyId = process.argv[2] || 'cmgpw60hk0009u0u0gw2mq0cq';

  console.log('Opening survey:', surveyId);

  const survey = await prisma.survey.update({
    where: { id: surveyId },
    data: {
      status: 'OPEN',
      openAt: new Date(),
    },
    include: {
      organization: {
        select: { name: true },
      },
    },
  });

  console.log('\n✅ Survey Opened Successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Title:', survey.title);
  console.log('Organization:', survey.organization?.name || 'N/A');
  console.log('Type:', survey.assessmentType);
  console.log('Status:', survey.status);
  console.log('Opened At:', survey.openAt?.toLocaleString());
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Survey is now accessible to participants!');

  await prisma.$disconnect();
}

openSurvey().catch((error) => {
  console.error('❌ Error opening survey:', error.message);
  process.exit(1);
});
