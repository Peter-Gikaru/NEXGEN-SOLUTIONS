const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function run() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'watch', mode: 'insensitive' } },
        { name: { contains: 'bag', mode: 'insensitive' } }
      ]
    },
    include: { category: true }
  });
  
  const fileContent = `// @ts-nocheck
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const productsToSeed = ${JSON.stringify(products, null, 2)};

async function main() {
  console.log('Seeding watches and bags...');
  for (const p of productsToSeed) {
    let category = await prisma.category.findUnique({ where: { slug: p.category.slug } });
    if (!category) { 
      category = await prisma.category.create({ data: { name: p.category.name, slug: p.category.slug } }); 
    }
    
    const { id, createdAt, updatedAt, category: cat, ...productData } = p;
    
    // Fix null JSON fields
    if (productData.variants === null) productData.variants = undefined;
    if (productData.specs === null) productData.specs = undefined;
    if (productData.imageUrls === null) productData.imageUrls = undefined;
    
    await prisma.product.upsert({ 
      where: { slug: p.slug }, 
      update: { ...productData, categoryId: category.id }, 
      create: { ...productData, categoryId: category.id } 
    });
    console.log('Seeded: ' + p.name);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
`;

  fs.writeFileSync('seed-watches-bags.ts', fileContent);
  console.log('Created seed file');
}

run();
