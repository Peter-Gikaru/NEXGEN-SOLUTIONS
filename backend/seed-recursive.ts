import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexgen.com' },
    update: {},
    create: {
      email: 'admin@nexgen.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log(`Admin user seeded: ${admin.email}`);

  console.log('Seeding recursive categories...');
  
  const laptops = await prisma.category.create({
    data: { name: 'Laptops', slug: 'laptops' }
  });

  const bagsAndSleeves = await prisma.category.create({
    data: { name: 'Laptop Bags & Sleeves', slug: 'laptop-bags-and-sleeves', parentId: laptops.id }
  });

  const sleeves = await prisma.category.create({
    data: { name: 'Sleeves', slug: 'sleeves', parentId: bagsAndSleeves.id }
  });

  await prisma.category.create({
    data: { name: '14 inch sleeves', slug: '14-inch-sleeves', parentId: sleeves.id }
  });

  await prisma.category.create({
    data: { name: '16 inch sleeves', slug: '16-inch-sleeves', parentId: sleeves.id }
  });

  const bags = await prisma.category.create({
    data: { name: 'Bags', slug: 'bags', parentId: bagsAndSleeves.id }
  });

  await prisma.category.create({
    data: { name: '14 inch bags', slug: '14-inch-bags', parentId: bags.id }
  });

  await prisma.category.create({
    data: { name: '16 inch bags', slug: '16-inch-bags', parentId: bags.id }
  });

  console.log('Categories seeded successfully!');

  console.log('Generating test CSV file...');
  const csvContent = `name,description,brand,price,compareAtPrice,stock,categoryName,imageUrls,specs
"Premium 14-inch Sleeve","High quality leather sleeve","HP",2500,3000,50,"14 inch sleeves","https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800","{}"
"Rugged 16-inch Bag","Waterproof laptop bag","Targus",4500,,20,"16 inch bags","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800","{}"
"Basic 14-inch Bag","Lightweight carrying bag","Generic",1500,2000,100,"14 inch bags","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800","{}"
"Sleek 16-inch Sleeve","Minimalist design sleeve","Dell",2800,,35,"16 inch sleeves","https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800","{}"`;

  const csvPath = path.join(__dirname, 'test_upload.csv');
  fs.writeFileSync(csvPath, csvContent);
  console.log(`Test CSV generated at: ${csvPath}`);

  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
