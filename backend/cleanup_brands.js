const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  let count = 0;
  for (const p of products) {
    if (p.specs && typeof p.specs === 'object' && !Array.isArray(p.specs)) {
      const specs = { ...p.specs };
      let changed = false;
      if ('brands' in specs) {
        delete specs['brands'];
        changed = true;
      }
      if ('.brands' in specs) {
        delete specs['.brands'];
        changed = true;
      }
      if ('brand' in specs) {
        delete specs['brand'];
        changed = true;
      }
      
      if (changed) {
        await prisma.product.update({
          where: { id: p.id },
          data: { specs }
        });
        count++;
      }
    }
  }
  console.log(`Cleaned up redundant brands from ${count} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
