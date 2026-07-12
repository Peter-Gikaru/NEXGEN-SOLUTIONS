import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all products...');
  
  // Need to delete related CartItems, OrderItems, Wishlist items, Reviews etc first or use Cascade
  // In Prisma, usually relation fields have onDelete: Cascade, but if not we might need to delete them manually.
  
  try {
    // Delete Cart Items
    await prisma.cartItem.deleteMany({});
    
    // Delete Order Items
    await prisma.orderItem.deleteMany({});
    
    // Delete Reviews
    await prisma.review.deleteMany({});

    // Delete Wishlists
    await prisma.wishlist.deleteMany({});
    
    // Delete PriceDropAlerts
    await prisma.priceDropAlert.deleteMany({});
    
    // Delete WarrantyClaims
    await prisma.warrantyClaim.deleteMany({});
    
    // Delete Products
    const result = await prisma.product.deleteMany({});
    console.log(`Deleted ${result.count} products.`);
  } catch (error) {
    console.error('Error deleting products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
