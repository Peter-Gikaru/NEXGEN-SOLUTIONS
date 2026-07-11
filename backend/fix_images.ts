import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const placeholderImages = [
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1531297172868-9f140cece067?w=500&auto=format&fit=crop&q=60'
];

async function main() {
  const products = await prisma.product.findMany();
  let updated = 0;
  for (const p of products) {
    let urls = [];
    try {
      urls = JSON.parse(p.imageUrls);
    } catch(e) {}
    
    // If any url starts with data/ or it's empty, replace it
    if (urls.length === 0 || urls.some((u:string) => u.startsWith('data/'))) {
      const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
      await prisma.product.update({
        where: { id: p.id },
        data: { imageUrls: JSON.stringify([randomImage]) }
      });
      updated++;
    }
  }
  console.log(`Updated images for ${updated} products.`);
}

main().finally(() => prisma.$disconnect());
