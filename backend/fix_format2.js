require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  const updates = [];
  
  for (let p of products) {
    if (p.imageUrls && p.imageUrls.startsWith('[')) {
      try {
        const arr = JSON.parse(p.imageUrls);
        const cleanStr = arr.join(',');
        updates.push(prisma.product.update({
          where: { id: p.id },
          data: { imageUrls: cleanStr }
        }));
      } catch (e) {}
    }
  }
  
  if (updates.length > 0) {
    await prisma.$transaction(updates);
    console.log(`Successfully reformatted ${updates.length} products.`);
  } else {
    console.log("No products needed updating.");
  }
}

main().finally(() => prisma.$disconnect());
