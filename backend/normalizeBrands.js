const { PrismaClient } = require('@prisma/client');

function normalizeBrand(rawBrand) {
  if (!rawBrand) return 'Generic';
  const b = String(rawBrand).toLowerCase().trim();
  
  if (b.includes('hp') || b.includes('hewlett')) return 'HP';
  if (b.includes('dell')) return 'Dell';
  if (b.includes('lenovo') || b.includes('thinkpad') || b.includes('ideapad')) return 'Lenovo';
  if (b.includes('apple') || b.includes('macbook') || b.includes('mac')) return 'Apple';
  if (b.includes('asus')) return 'ASUS';
  if (b.includes('acer')) return 'Acer';
  if (b.includes('samsung')) return 'Samsung';
  if (b.includes('msi')) return 'MSI';
  if (b.includes('microsoft') || b.includes('surface')) return 'Microsoft';
  if (b.includes('razer')) return 'Razer';
  if (b.includes('alienware')) return 'Alienware';
  if (b.includes('lg')) return 'LG';
  if (b.includes('toshiba')) return 'Toshiba';
  if (b.includes('huawei')) return 'Huawei';
  if (b.includes('chuwi')) return 'Chuwi';
  
  return rawBrand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to normalize.`);
  let updated = 0;
  for (const product of products) {
    const normalized = normalizeBrand(product.brand);
    if (product.brand !== normalized) {
      await prisma.product.update({
        where: { id: product.id },
        data: { brand: normalized }
      });
      console.log(`Updated brand for ${product.name}: "${product.brand}" -> "${normalized}"`);
      updated++;
    }
  }
  console.log(`Successfully normalized ${updated} products.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
