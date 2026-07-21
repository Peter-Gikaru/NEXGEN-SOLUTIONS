import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const ALLOWED_TABLES: Record<string, string[]> = {
  user: ['id', 'email', 'name', 'role', 'status', 'createdAt', 'updatedAt'],
  product: ['id', 'name', 'slug', 'description', 'price', 'stock', 'brand', 'isActive', 'isRefurbished', 'createdAt', 'updatedAt'],
  order: ['id', 'userId', 'totalAmount', 'orderStatus', 'paymentStatus', 'paymentMethod', 'shippingAddress', 'createdAt', 'updatedAt'],
};

const PRISMA_MODELS: Record<string, string> = {
  user: 'user',
  product: 'product',
  order: 'order',
};

async function test() {
  try {
    const table = 'order';
    const fields = ALLOWED_TABLES['order'];
    const filters: any[] = [];

    const normalizedTable = table.toLowerCase();
    const allowedFields = ALLOWED_TABLES[normalizedTable];
    
    const selectClause: any = {};
    fields.forEach((field: string) => {
      if (allowedFields.includes(field)) {
        selectClause[field] = true;
      }
    });

    const whereClause: any = {};
    const prismaModelName = PRISMA_MODELS[normalizedTable];
    const prismaDelegate = (prisma as any)[prismaModelName];

    console.log(`Executing Prisma query for model: ${prismaModelName}`);
    console.log(`Select clause:`, selectClause);
    
    const results = await prismaDelegate.findMany({
      where: whereClause,
      select: selectClause,
      take: 10
    });

    console.log(`Success! Fetched ${results.length} results.`);
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
