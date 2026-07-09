import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.flashSale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.promoCode.deleteMany();

  const passwordHashAdmin = await bcrypt.hash('Admin@12345', 12);
  const passwordHashUser = await bcrypt.hash('User@12345', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexgen.com',
      name: 'Super Admin',
      passwordHash: passwordHashAdmin,
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'user@nexgen.com',
      name: 'John Doe',
      passwordHash: passwordHashUser,
      role: 'USER',
    },
  });

  await prisma.cart.create({
    data: {
      userId: customer.id,
    },
  });

  const catAllInOnes = await prisma.category.create({ data: { name: 'All-in-Ones', slug: 'all-in-ones' } });
  const catDesktops = await prisma.category.create({ data: { name: 'Desktops', slug: 'desktops' } });
  const catPCAccessories = await prisma.category.create({ data: { name: 'PC Accessories', slug: 'pc-accessories' } });
  const catLaptops = await prisma.category.create({ data: { name: 'Laptops', slug: 'laptops' } });
  const catMobiles = await prisma.category.create({ data: { name: 'Mobiles', slug: 'mobiles' } });
  const catMonitors = await prisma.category.create({ data: { name: 'Monitors', slug: 'monitors' } });
  const catPrinters = await prisma.category.create({ data: { name: 'Printers', slug: 'printers' } });
  const catUPS = await prisma.category.create({ data: { name: 'UPS', slug: 'ups' } });

  const hpSub = await prisma.category.create({ data: { name: 'HP', slug: 'hp-laptops', parentId: catLaptops.id } });
  const dellSub = await prisma.category.create({ data: { name: 'Dell', slug: 'dell-laptops', parentId: catLaptops.id } });
  const lenovoSub = await prisma.category.create({ data: { name: 'Lenovo', slug: 'lenovo-laptops', parentId: catLaptops.id } });
  const appleSub = await prisma.category.create({ data: { name: 'Apple', slug: 'apple-laptops', parentId: catLaptops.id } });
  const asusSub = await prisma.category.create({ data: { name: 'Asus', slug: 'asus-laptops', parentId: catLaptops.id } });
  const acerSub = await prisma.category.create({ data: { name: 'Acer', slug: 'acer-laptops', parentId: catLaptops.id } });
  const toshibaSub = await prisma.category.create({ data: { name: 'Toshiba', slug: 'toshiba-laptops', parentId: catLaptops.id } });
  const bagSub = await prisma.category.create({ data: { name: 'Laptop Bags & Sleeves', slug: 'laptop-bags', parentId: catLaptops.id } });

  const storageSub = await prisma.category.create({ data: { name: 'External Storage', slug: 'storage-accessories', parentId: catPCAccessories.id } });
  const peripheralsSub = await prisma.category.create({ data: { name: 'Keyboards & Mice', slug: 'peripherals', parentId: catPCAccessories.id } });
  const hubSub = await prisma.category.create({ data: { name: 'USB Hubs & Docks', slug: 'hubs', parentId: catPCAccessories.id } });
  const coolingSub = await prisma.category.create({ data: { name: 'Laptop Cooling Pads', slug: 'cooling', parentId: catPCAccessories.id } });

  const smartphoneSub = await prisma.category.create({ data: { name: 'Smartphones', slug: 'smartphones', parentId: catMobiles.id } });
  const tabletSub = await prisma.category.create({ data: { name: 'Tablets & iPads', slug: 'tablets', parentId: catMobiles.id } });
  const powerbankSub = await prisma.category.create({ data: { name: 'Powerbanks & Cables', slug: 'powerbanks', parentId: catMobiles.id } });

  const gamingMonSub = await prisma.category.create({ data: { name: 'Gaming Monitors', slug: 'gaming-monitors', parentId: catMonitors.id } });
  const officeMonSub = await prisma.category.create({ data: { name: 'Office Monitors', slug: 'office-monitors', parentId: catMonitors.id } });
  const proMonSub = await prisma.category.create({ data: { name: '4K Professional Screens', slug: '4k-monitors', parentId: catMonitors.id } });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
