import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Laptops', slug: 'laptops', description: 'Premium laptops for work and gaming' },
  { name: 'Mobile Phones', slug: 'mobile-phones', description: 'Latest smartphones and mobile devices' },
  { name: 'Printers', slug: 'printers', description: 'Office and home printers' },
  { name: 'Monitors', slug: 'monitors', description: 'High resolution displays and monitors' },
  { name: 'UPS', slug: 'ups', description: 'Uninterruptible power supplies for battery backup' },
];

async function main() {
  console.log('Seeding default categories...');
  for (const cat of defaultCategories) {
    const exists = await prisma.category.findUnique({
      where: { slug: cat.slug }
    });
    
    if (!exists) {
      await prisma.category.create({
        data: cat
      });
      console.log(`Created category: ${cat.name}`);
    } else {
      console.log(`Category already exists: ${cat.name}`);
    }
  }
  console.log('Finished seeding categories.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
