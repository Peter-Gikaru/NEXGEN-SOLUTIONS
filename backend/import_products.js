const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = fs.readFileSync('../src/data/products.ts', 'utf8');

const arrayMatch = data.match(/export const sampleProducts: Product\[\] = (\[[\s\S]*\]);/);
if (!arrayMatch) {
  console.log("Could not parse products array");
  process.exit(1);
}

let arrayStr = arrayMatch[1];
arrayStr = arrayStr.replace(/laptopSilver/g, "'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60'");
arrayStr = arrayStr.replace(/laptopDark/g, "'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60'");
arrayStr = arrayStr.replace(/laptopGaming/g, "'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60'");

const products = eval(arrayStr);

async function main() {
  console.log(`Found ${products.length} products to import`);
  
  const catLaptops = await prisma.category.findFirst({ where: { name: 'Laptops' } });
  const catAccessories = await prisma.category.findFirst({ where: { name: 'PC Accessories' } });
  
  const subBusiness = await prisma.subcategory.findFirst({ where: { name: 'Business Laptops' } });
  const subGaming = await prisma.subcategory.findFirst({ where: { name: 'Gaming Laptops' } });
  const subPeripherals = await prisma.subcategory.findFirst({ where: { name: 'Keyboards & Mice' } });

  await prisma.product.deleteMany({});

  for (const p of products) {
    const isLaptop = p.category === 'Laptops';
    const isGaming = p.title.toLowerCase().includes('gaming') || p.title.toLowerCase().includes('rtx');
    
    await prisma.product.create({
      data: {
        name: p.title,
        slug: p.id,
        description: p.description,
        brand: p.brand,
        price: p.price,
        compareAtPrice: p.originalPrice,
        stock: p.stockCount || 10,
        categoryId: isLaptop ? catLaptops.id : catAccessories.id,
        subcategoryId: isLaptop ? (isGaming ? subGaming.id : subBusiness.id) : subPeripherals.id,
        imageUrls: JSON.stringify([p.image]),
        specs: JSON.stringify({}),
      }
    });
    console.log(`Imported ${p.title}`);
  }
  
  console.log("Import complete");
}

main().catch(e => {
  console.error(e);
}).finally(() => {
  prisma.$disconnect();
});
