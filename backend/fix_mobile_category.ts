import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing Duplicate Mobile Categories...');

  const targetCategory = await prisma.category.findFirst({
    where: { 
      name: {
        in: ['Mobile Phones', 'mobile phones', 'Mobile phones']
      }
    }
  });

  if (!targetCategory) {
    console.log('Error: "Mobile Phones" category not found. Make sure it was seeded.');
    return;
  }

  console.log(`Target Category Found: ${targetCategory.name} (ID: ${targetCategory.id})`);

  
  const redundantCategories = await prisma.category.findMany({
    where: {
      name: {
        in: ['Mobile', 'mobile', 'Mobiles', 'mobiles']
      }
    }
  });

  for (const redundantCat of redundantCategories) {
    console.log(`Found redundant category: ${redundantCat.name} (ID: ${redundantCat.id})`);
    
    
    const updatedProducts = await prisma.product.updateMany({
      where: { categoryId: redundantCat.id },
      data: { categoryId: targetCategory.id }
    });
    
    console.log(`Moved ${updatedProducts.count} products from ${redundantCat.name} to ${targetCategory.name}`);

    
    await prisma.category.delete({
      where: { id: redundantCat.id }
    });
    console.log(`Deleted redundant category: ${redundantCat.name}`);
  }

  console.log('Cleanup complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
