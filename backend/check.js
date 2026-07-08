const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findMany().then(p => {
  console.log(p.map(x=>x.name));
  prisma.$disconnect();
});
