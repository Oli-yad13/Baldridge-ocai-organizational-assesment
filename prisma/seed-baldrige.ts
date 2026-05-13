import { PrismaClient } from '@prisma/client';
import { baldrigeData } from '../src/lib/baldrige-data';

const prisma = new PrismaClient();

async function seedBaldrigeData() {
  console.log('🌱 Starting Baldrige data seeding...');

  try {
    // First, seed organizational profile as Category 0
    console.log('📝 Seeding Organizational Profile...');

    const orgProfileCategory = await prisma.baldrigeCategory.upsert({
      where: { displayOrder: 0 },
      update: {
        name: 'Organizational Profile',
        description: 'Information about your organization that provides context for the assessment',
        totalPoints: 0,
      },
      create: {
        name: 'Organizational Profile',
        displayOrder: 0,
        description: 'Information about your organization that provides context for the assessment',
        totalPoints: 0,
      },
    });

    // Seed organizational profile subcategories and questions
    for (const section of baldrigeData['organizational-profile']) {
      const subcategory = await prisma.baldrigeSubcategory.upsert({
        where: {
          categoryId_displayOrder: {
            categoryId: orgProfileCategory.id,
            displayOrder: parseInt(section.item.replace('P.', '')),
          },
        },
        update: {
          name: section.title,
          points: 0,
        },
        create: {
          categoryId: orgProfileCategory.id,
          name: section.title,
          displayOrder: parseInt(section.item.replace('P.', '')),
          points: 0,
        },
      });

      // Seed questions for this subcategory
      for (let i = 0; i < section.questions.length; i++) {
        const question = section.questions[i];

        // Check if question exists
        const existing = await prisma.baldrigeQuestion.findUnique({
          where: { itemCode: question.itemCode },
        });

        if (existing) {
          // Update existing question
          await prisma.baldrigeQuestion.update({
            where: { itemCode: question.itemCode },
            data: {
              questionText: question.text,
              orderIndex: i,
            },
          });
        } else {
          // Create new question
          await prisma.baldrigeQuestion.create({
            data: {
              itemCode: question.itemCode,
              questionText: question.text,
              orderIndex: i,
              subcategoryId: subcategory.id,
            },
          });
        }
      }
    }

    console.log('✅ Organizational Profile seeded');

    // Now seed the main categories (1-7)
    for (const category of baldrigeData.categories) {
      console.log(`📝 Seeding Category ${category.category}: ${category.title}...`);

      const categoryPoints = category.items.reduce((sum, item) => sum + item.points, 0);

      const dbCategory = await prisma.baldrigeCategory.upsert({
        where: { displayOrder: parseInt(category.category) },
        update: {
          name: category.title,
          totalPoints: categoryPoints,
        },
        create: {
          name: category.title,
          displayOrder: parseInt(category.category),
          totalPoints: categoryPoints,
        },
      });

      // Seed subcategories (items) for this category
      for (let itemIndex = 0; itemIndex < category.items.length; itemIndex++) {
        const item = category.items[itemIndex];
        const subcategory = await prisma.baldrigeSubcategory.upsert({
          where: {
            categoryId_displayOrder: {
              categoryId: dbCategory.id,
              displayOrder: itemIndex + 1, // Use 1-based index within category
            },
          },
          update: {
            name: item.title,
            points: item.points,
          },
          create: {
            categoryId: dbCategory.id,
            name: item.title,
            displayOrder: itemIndex + 1,
            points: item.points,
          },
        });

        // Seed questions for this subcategory
        for (let i = 0; i < item.questions.length; i++) {
          const question = item.questions[i];

          // Check if question exists
          const existing = await prisma.baldrigeQuestion.findUnique({
            where: { itemCode: question.itemCode },
          });

          if (existing) {
            // Update existing question
            await prisma.baldrigeQuestion.update({
              where: { itemCode: question.itemCode },
              data: {
                questionText: question.text,
                orderIndex: i,
              },
            });
          } else {
            // Create new question
            await prisma.baldrigeQuestion.create({
              data: {
                itemCode: question.itemCode,
                questionText: question.text,
                orderIndex: i,
                subcategoryId: subcategory.id,
              },
            });
          }
        }
      }

      console.log(`✅ Category ${category.category} seeded`);
    }

    console.log('🎉 Baldrige data seeding completed successfully!');

    // Print summary
    const categoryCount = await prisma.baldrigeCategory.count();
    const subcategoryCount = await prisma.baldrigeSubcategory.count();
    const questionCount = await prisma.baldrigeQuestion.count();

    console.log('\n📊 Summary:');
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Subcategories: ${subcategoryCount}`);
    console.log(`   Questions: ${questionCount}`);

  } catch (error) {
    console.error('❌ Error seeding Baldrige data:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting database seeding...\n');

  await seedBaldrigeData();

  console.log('\n✅ All seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
