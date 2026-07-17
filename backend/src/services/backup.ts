import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

export const runBackup = async (): Promise<void> => {
  const backupsDir = path.join(__dirname, '../../../backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupsDir, `backup-${timestamp}.sql`);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    logger.error('Database backup failed: DATABASE_URL not set in environment.');
    return;
  }

  exec('pg_dump --version', (err) => {
    if (err) {
      logger.warn('pg_dump not available in system path. Writing raw JSON dump of system files as fallback.');
      runFallbackJsonBackup(backupsDir, timestamp);
      return;
    }

    exec(`pg_dump "${dbUrl}" -F p -f "${backupFile}"`, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Database pg_dump failed: ${error.message}. Output: ${stderr}`);
        runFallbackJsonBackup(backupsDir, timestamp);
        return;
      }
      logger.info(`Database backup completed successfully at ${backupFile}`);
      cleanOldBackups(backupsDir);
    });
  });
};

const runFallbackJsonBackup = async (backupsDir: string, timestamp: string) => {
  try {
    const backupPath = path.join(backupsDir, `json-backup-${timestamp}.json`);
    const backupData: Record<string, any> = {};
    
    const { PrismaClient } = await import('@prisma/client');
    const prismaInstance = new PrismaClient();
    
    backupData.users = await prismaInstance.user.findMany();
    backupData.products = await prismaInstance.product.findMany();
    backupData.categories = await prismaInstance.category.findMany();
    backupData.orders = await prismaInstance.order.findMany({ include: { items: true } });
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
    logger.info(`Fallback JSON backup completed successfully at ${backupPath}`);
    cleanOldBackups(backupsDir);
  } catch (err: any) {
    logger.error(`Fallback database JSON backup failed: ${err.message}`);
  }
};

const cleanOldBackups = (backupsDir: string) => {
  try {
    const files = fs.readdirSync(backupsDir);
    if (files.length > 7) {
      const sorted = files
        .map(f => ({ name: f, time: fs.statSync(path.join(backupsDir, f)).mtime.getTime() }))
        .sort((a, b) => a.time - b.time);
      
      const toDelete = sorted.slice(0, sorted.length - 7);
      toDelete.forEach(file => {
        fs.unlinkSync(path.join(backupsDir, file.name));
        logger.info(`Deleted old backup file: ${file.name}`);
      });
    }
  } catch (err: any) {
    logger.warn(`Failed to clean old backups: ${err.message}`);
  }
};
