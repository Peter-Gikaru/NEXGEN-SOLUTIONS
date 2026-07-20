const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.product.create({
    data: {
      name: 'Test Spec Product',
      description: 'Test',
      brand: 'Test',
      price: 100,
      stock: 10,
      isActive: true,
      slug: 'test-spec-product',
      imageUrls: [],
      categoryId: null,
      specs: { 'Storage': '512GB SSD', 'Battery': '60Wh' }
    }
  });

  const countEquals = await prisma.product.count({
    where: {
      specs: {
        path: ['Storage'],
        equals: '512GB SSD'
      }
    }
  });

  const countContains = await prisma.product.count({
    where: {
      specs: {
        path: ['Storage'],
        string_contains: '512GB SSD'
      }
    }
  });

  console.log('countEquals:', countEquals);
  console.log('countContains:', countContains);

  await prisma.product.delete({ where: { id: p.id } });
}
run().catch(e => console.error(e)).finally(() => prisma.$disconnect());
