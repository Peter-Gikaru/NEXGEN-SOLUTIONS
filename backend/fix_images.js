require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const placeholders = [
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1531297172868-9f140cece067?w=500&auto=format&fit=crop&q=60'
];

async function main() {
  const products = await prisma.product.findMany();
  let c = 0;
  for (let p of products) {
    let u = [];
    try {
      u = JSON.parse(p.imageUrls);
    } catch(e) {}
    if (u.length === 0 || u.some(x => String(x).startsWith('data/'))) {
      const img = placeholders[Math.floor(Math.random() * placeholders.length)];
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrls: JSON.stringify([img]) }
      });
      c++;
    }
  }
  console.log('Updated ' + c + ' products.');
}
main().finally(() => prisma.$disconnect());
