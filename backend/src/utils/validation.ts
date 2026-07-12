import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
};

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  brand: z.string().min(1, 'Brand is required'),
  price: z.number().positive('Price must be a positive number'),
  compareAtPrice: z.number().positive('Compare at price must be a positive number').optional().nullable(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  categoryId: z.string().uuid('Invalid category ID'),
  subcategoryId: z.string().uuid('Invalid subcategory ID').optional().nullable(),
  imageUrls: z.array(z.string()).optional(),
  specs: z.record(z.any()).refine((val) => typeof val === 'object', {
    message: 'Specs must be a valid key-value object',
  }),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const orderSchema = z.object({
  guestName: z.string().min(2, 'Name is required for guest checkout').optional(),
  guestEmail: z.string().email('Valid email is required for guest checkout').optional(),
  shippingAddress: z.object({
    phoneNumber: z.string().regex(/^(?:254|\+254|0)?(7[0-9]{8}|1[0-9]{8})$/, 'Invalid Kenyan phone number'),
    city: z.string().min(2, 'City is required'),
    area: z.string().min(2, 'Area is required'),
    detailedAddress: z.string().min(5, 'Detailed address is required'),
  }),
  expectedSubtotal: z.number().positive().optional(),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  paymentMethod: z.enum(['MPESA', 'CARD', 'COD']),
  promoCode: z.string().optional(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  serviceRating: z.number().int().min(1).max(5, 'Service rating must be between 1 and 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters'),
  imageUrls: z.string().optional().nullable(),
});

export const promoCodeSchema = z.object({
  code: z.string().min(3).regex(/^[A-Z0-9]+$/, 'Code must be alphanumeric and uppercase'),
  discountType: z.enum(['PERCENT', 'FLAT']),
  discountValue: z.number().positive(),
  maxUses: z.number().int().positive().optional(),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid expiry date',
  }),
  isForAbandonedCart: z.boolean().optional(),
});
export const flashSaleSchema = z.object({
  productId: z.string().uuid(),
  salePrice: z.number().positive(),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start time',
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end time',
  }),
});
