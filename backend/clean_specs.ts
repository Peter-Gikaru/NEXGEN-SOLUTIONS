import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanSpecs() {
  const products = await prisma.product.findMany({
    select: { id: true, specs: true }
  });

  let updatedCount = 0;

  for (const product of products) {
    if (product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs)) {
      const oldSpecs = product.specs as Record<string, any>;
      const newSpecs: Record<string, any> = {};
      let changed = false;

      for (const [key, value] of Object.entries(oldSpecs)) {
        let cleanKey = key.trim();
        if (cleanKey.startsWith('.')) {
          cleanKey = cleanKey.replace(/^\.+/, '').trim();
          changed = true;
        }
        
        if (cleanKey.length > 0) {
          const capitalizedKey = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1);
          if (capitalizedKey !== key) changed = true;
          newSpecs[capitalizedKey] = value;
        } else {
          newSpecs[key] = value;
        }
      }

      if (changed) {
        await prisma.product.update({
          where: { id: product.id },
          data: { specs: newSpecs }
        });
        updatedCount++;
      }
    }
  }

  console.log(`Cleaned specs for ${updatedCount} products.`);
}

cleanSpecs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
