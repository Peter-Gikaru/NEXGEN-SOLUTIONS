require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  let updated = 0;
  for (let p of products) {
    if (p.imageUrls && p.imageUrls.startsWith('[')) {
      try {
        const arr = JSON.parse(p.imageUrls);
        const cleanStr = arr.join(','); 
        await prisma.product.update({
          where: { id: p.id },
          data: { imageUrls: cleanStr }
        });
        updated++;
      } catch (e) {
        console.error("Error parsing", p.id);
      }
    }
  }
  console.log(`Successfully reformatted ${updated} products' image URLs.`);
}

main().finally(() => prisma.$disconnect());
