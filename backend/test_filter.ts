import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.findMany({
      where: {
        specs: {
          not: null
        }
      },
      select: { id: true, name: true, specs: true },
      take: 2
    });
    console.log(JSON.stringify(products, null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
