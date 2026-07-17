const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const logsCount = await prisma.auditLog.count();
    console.log('Total audit logs in database:', logsCount);
    
    const logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
    console.log('Audit Logs:', JSON.stringify(logs, null, 2));
  } catch (e) {
    console.log('Error querying AuditLog:', e.message);
  }
}
main().then(() => prisma.$disconnect()).catch(err => console.error(err));
