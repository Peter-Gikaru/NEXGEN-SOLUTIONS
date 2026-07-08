const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const passwordHashAdmin = await bcrypt.hash('Admin@12345', 12);
  const passwordHashUser = await bcrypt.hash('User@12345', 12);

  await prisma.user.create({
    data: {
      email: 'admin@nexgen.com',
      name: 'Super Admin',
      passwordHash: passwordHashAdmin,
      role: 'ADMIN',
    },
  });

  await prisma.user.create({
    data: {
      email: 'user@nexgen.com',
      name: 'John Doe',
      passwordHash: passwordHashUser,
      role: 'USER',
    },
  });
  console.log("Users created");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
