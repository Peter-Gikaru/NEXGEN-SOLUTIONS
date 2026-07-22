import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Removed deleteMany calls to prevent accidental data loss during prisma db push

  const passwordHashAdmin = await bcrypt.hash('Admin@12345', 12);
  const passwordHashUser = await bcrypt.hash('User@12345', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexgen.com' },
    update: {},
    create: {
      email: 'admin@nexgen.com',
      name: 'Super Admin',
      passwordHash: passwordHashAdmin,
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'user@nexgen.com' },
    update: {},
    create: {
      email: 'user@nexgen.com',
      name: 'John Doe',
      passwordHash: passwordHashUser,
      role: 'USER',
    },
  });

  await prisma.cart.upsert({
    where: { userId: customer.id },
    update: {},
    create: {
      userId: customer.id,
    },
  });

  const createCat = async (data: any) => prisma.category.upsert({ where: { slug: data.slug }, update: {}, create: data });

  const catAllInOnes = await createCat({ name: 'All-in-Ones', slug: 'all-in-ones' });
  const catDesktops = await createCat({ name: 'Desktops', slug: 'desktops' });
  const catPCAccessories = await createCat({ name: 'PC Accessories', slug: 'pc-accessories' });
  const catLaptops = await createCat({ name: 'Laptops', slug: 'laptops' });
  const catMobiles = await createCat({ name: 'Mobiles', slug: 'mobiles' });
  const catMonitors = await createCat({ name: 'Monitors', slug: 'monitors' });
  const catPrinters = await createCat({ name: 'Printers', slug: 'printers' });
  const catUPS = await createCat({ name: 'UPS', slug: 'ups' });

  const hpSub = await createCat({ name: 'HP', slug: 'hp-laptops', parentId: catLaptops.id });
  const dellSub = await createCat({ name: 'Dell', slug: 'dell-laptops', parentId: catLaptops.id });
  const lenovoSub = await createCat({ name: 'Lenovo', slug: 'lenovo-laptops', parentId: catLaptops.id });
  const appleSub = await createCat({ name: 'Apple', slug: 'apple-laptops', parentId: catLaptops.id });
  const asusSub = await createCat({ name: 'Asus', slug: 'asus-laptops', parentId: catLaptops.id });
  const acerSub = await createCat({ name: 'Acer', slug: 'acer-laptops', parentId: catLaptops.id });
  const toshibaSub = await createCat({ name: 'Toshiba', slug: 'toshiba-laptops', parentId: catLaptops.id });
  const bagSub = await createCat({ name: 'Laptop Bags & Sleeves', slug: 'laptop-bags', parentId: catLaptops.id });

  const storageSub = await createCat({ name: 'External Storage', slug: 'storage-accessories', parentId: catPCAccessories.id });
  const peripheralsSub = await createCat({ name: 'Keyboards & Mice', slug: 'peripherals', parentId: catPCAccessories.id });
  const hubSub = await createCat({ name: 'USB Hubs & Docks', slug: 'hubs', parentId: catPCAccessories.id });
  const coolingSub = await createCat({ name: 'Laptop Cooling Pads', slug: 'cooling', parentId: catPCAccessories.id });

  const smartphoneSub = await createCat({ name: 'Smartphones', slug: 'smartphones', parentId: catMobiles.id });
  const tabletSub = await createCat({ name: 'Tablets & iPads', slug: 'tablets', parentId: catMobiles.id });
  const powerbankSub = await createCat({ name: 'Powerbanks & Cables', slug: 'powerbanks', parentId: catMobiles.id });

  const gamingMonSub = await createCat({ name: 'Gaming Monitors', slug: 'gaming-monitors', parentId: catMonitors.id });
  const officeMonSub = await createCat({ name: 'Office Monitors', slug: 'office-monitors', parentId: catMonitors.id });
  const proMonSub = await createCat({ name: '4K Professional Screens', slug: '4k-monitors', parentId: catMonitors.id });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
