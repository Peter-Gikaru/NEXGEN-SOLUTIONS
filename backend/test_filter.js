const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.$queryRaw`
      SELECT specs FROM "Product" 
      WHERE specs::text ILIKE '%ex uk%' OR specs::text ILIKE '%refurbished%' OR specs::text ILIKE '%new%'
      LIMIT 5;
    `;
    console.log("Specs with condition in json:", JSON.stringify(products, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
