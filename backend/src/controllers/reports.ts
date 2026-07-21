import { Request, Response } from 'express';
import prisma from '../config/db';

const ALLOWED_TABLES: Record<string, string[]> = {
  user: ['id', 'email', 'name', 'role', 'status', 'createdAt', 'updatedAt'],
  product: ['id', 'name', 'slug', 'description', 'price', 'stock', 'brand', 'isActive', 'condition', 'createdAt', 'updatedAt'],
  order: ['id', 'userId', 'totalAmount', 'orderStatus', 'paymentStatus', 'paymentMethod', 'shippingAddress', 'createdAt', 'updatedAt'],
  orderitem: ['id', 'orderId', 'productId', 'quantity', 'price', 'createdAt'],
  category: ['id', 'name', 'slug'],
  review: ['id', 'productId', 'userId', 'rating', 'comment', 'createdAt'],
  promocode: ['id', 'code', 'discountValue', 'discountType', 'expiryDate', 'active', 'usedCount', 'createdAt'],
  returnrequest: ['id', 'orderId', 'userId', 'reason', 'status', 'adminNotes', 'createdAt', 'updatedAt'],
  warrantyclaim: ['id', 'orderId', 'productId', 'userId', 'issueType', 'description', 'status', 'adminNotes', 'createdAt', 'updatedAt'],
  adminlog: ['id', 'adminId', 'action', 'details', 'ipAddress', 'createdAt'],
  paymenttransaction: ['id', 'orderId', 'provider', 'providerRef', 'amount', 'status', 'createdAt', 'updatedAt'],
  auditlog: ['id', 'userId', 'sessionId', 'action', 'details', 'ipAddress', 'userAgent', 'severity', 'createdAt']
};

const PRISMA_MODELS: Record<string, string> = {
  user: 'user',
  product: 'product',
  order: 'order',
  orderitem: 'orderItem',
  category: 'category',
  review: 'review',
  promocode: 'promoCode',
  returnrequest: 'returnRequest',
  warrantyclaim: 'warrantyClaim',
  adminlog: 'adminLog',
  paymenttransaction: 'paymentTransaction',
  auditlog: 'auditLog'
};

export const generateDynamicReport = async (req: Request, res: Response) => {
  try {
    const { table, fields, filters } = req.body;

    if (!table || typeof table !== 'string') {
      return res.status(400).json({ message: 'Table is required' });
    }

    const normalizedTable = table.toLowerCase();
    if (!ALLOWED_TABLES[normalizedTable]) {
      return res.status(400).json({ message: 'Invalid or unauthorized table' });
    }

    const allowedFields = ALLOWED_TABLES[normalizedTable];
    
    // Select specific fields
    const selectClause: any = {};
    if (fields && Array.isArray(fields) && fields.length > 0) {
      fields.forEach((field: string) => {
        if (allowedFields.includes(field)) {
          selectClause[field] = true;
        }
      });
    } else {
      allowedFields.forEach((field: string) => {
        selectClause[field] = true;
      });
    }

    // Build where clause
    const whereClause: any = {};
    if (filters && Array.isArray(filters)) {
      filters.forEach((filter: any) => {
        const { field, operator, value } = filter;
        if (allowedFields.includes(field)) {
          // Determine the correct Prisma operator
          let prismaOp = 'equals';
          let parsedValue = value;

          // Convert value to correct type based on basic heuristics if needed
          if (value === 'true') parsedValue = true;
          else if (value === 'false') parsedValue = false;
          else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);

          switch (operator) {
            case '=': prismaOp = 'equals'; break;
            case '!=': prismaOp = 'not'; break;
            case '>': prismaOp = 'gt'; break;
            case '>=': prismaOp = 'gte'; break;
            case '<': prismaOp = 'lt'; break;
            case '<=': prismaOp = 'lte'; break;
            case 'contains': 
              prismaOp = 'contains'; 
              parsedValue = String(value);
              break;
            case 'startsWith':
              prismaOp = 'startsWith';
              parsedValue = String(value);
              break;
            case 'endsWith':
              prismaOp = 'endsWith';
              parsedValue = String(value);
              break;
            case 'in':
              prismaOp = 'in';
              parsedValue = Array.isArray(value) ? value : String(value).split(',').map((s: string) => s.trim());
              break;
          }

          if (!whereClause[field]) whereClause[field] = {};
          whereClause[field][prismaOp] = parsedValue;
        }
      });
    }

    // Ensure we have access to the prisma delegate dynamically
    const prismaModelName = PRISMA_MODELS[normalizedTable];
    const prismaDelegate = prismaModelName ? (prisma as any)[prismaModelName] : null;
    
    if (!prismaDelegate) {
      return res.status(500).json({ message: `Internal server error mapping model: ${normalizedTable}` });
    }

    const results = await prismaDelegate.findMany({
      where: whereClause,
      select: selectClause,
      take: 1000 // Limit results to prevent crashing
    });

    res.json(results);
  } catch (error: any) {
    console.error('Failed to generate dynamic report:', error);
    res.status(500).json({ message: 'Failed to generate dynamic report', error: error.message });
  }
};
