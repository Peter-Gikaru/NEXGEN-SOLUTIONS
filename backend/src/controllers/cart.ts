import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!req.user && !sessionId) {
      return res.status(401).json({ message: 'Authentication or session ID required' });
    }

    let cart;
    
    if (req.user) {
      cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                flashSale: {
                  where: {
                    active: true,
                    startTime: { lte: new Date() },
                    endTime: { gte: new Date() },
                  },
                },
              },
            },
          },
        },
      },
      });
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  flashSale: {
                    where: {
                      active: true,
                      startTime: { lte: new Date() },
                      endTime: { gte: new Date() },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (!cart) {
      cart = await prisma.cart.create({
        data: req.user ? { userId: req.user.id } : { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  flashSale: {
                    where: {
                      active: true,
                      startTime: { lte: new Date() },
                      endTime: { gte: new Date() },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    const formattedItems = cart.items.map((item) => {
      let imageUrlsParsed: any = [];
      if (Array.isArray(item.product.imageUrls)) {
        imageUrlsParsed = item.product.imageUrls;
      } else if (typeof item.product.imageUrls === 'string') {
        try { imageUrlsParsed = JSON.parse(item.product.imageUrls); } catch(e) { imageUrlsParsed = [item.product.imageUrls]; }
      }

      const activeFlashSale = item.product.flashSale;
      const finalPrice = activeFlashSale ? activeFlashSale.salePrice : item.product.price;

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: finalPrice,
          compareAtPrice: item.product.compareAtPrice,
          stock: item.product.stock,
          brand: item.product.brand,
          description: item.product.description,
          category: item.product.category,
          imageUrls: imageUrlsParsed,
        },
      };
    });

    return res.json({
      id: cart.id,
      items: formattedItems,
    });
  } catch (error) {
    return next(error);
  }
};

export const addToCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!req.user && !sessionId) {
      return res.status(401).json({ message: 'Authentication or session ID required' });
    }

    const { productId, quantity = 1 } = req.body;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: productId },
          { slug: productId }
        ]
      },
      include: {
        flashSale: {
          where: {
            active: true,
            startTime: { lte: new Date() },
            endTime: { gte: new Date() },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    let cart;
    if (req.user) {
      cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
      });
    } else {
      cart = await prisma.cart.findUnique({
        where: { sessionId },
      });
    }

    if (!cart) {
      cart = await prisma.cart.create({
        data: req.user ? { userId: req.user.id } : { sessionId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
      },
    });

    if (existingItem) {
      const nextQuantity = existingItem.quantity + quantity;
      if (nextQuantity > product.stock) {
        return res.status(400).json({ message: `Only ${product.stock} units available` });
      }
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: nextQuantity },
      });
      return res.json(updatedItem);
    }
    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} units available` });
    }

    const activeFlashSale = product.flashSale;
    const finalPrice = activeFlashSale ? activeFlashSale.salePrice : product.price;

    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity,
        priceAtAddition: finalPrice,
      },
    });

    return res.status(201).json(newItem);
  } catch (error) {
    return next(error);
  }
};

export const updateCartItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!req.user && !sessionId) {
      return res.status(401).json({ message: 'Authentication or session ID required' });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true, product: true },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (req.user && cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (!req.user && cartItem.cart.sessionId !== sessionId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id },
      });
      return res.json({ message: 'Item removed from cart' });
    }
    if (quantity > cartItem.product.stock) {
      return res.status(400).json({ message: `Only ${cartItem.product.stock} units available` });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return res.json(updatedItem);
  } catch (error) {
    return next(error);
  }
};

export const removeFromCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!req.user && !sessionId) {
      return res.status(401).json({ message: 'Authentication or session ID required' });
    }

    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (req.user && cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (!req.user && cartItem.cart.sessionId !== sessionId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    return res.json({ message: 'Item removed from cart' });
  } catch (error) {
    return next(error);
  }
};

export const clearCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    
    if (!req.user && !sessionId) {
      return res.status(401).json({ message: 'Authentication or session ID required' });
    }

    let cart;
    if (req.user) {
      cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
      });
    } else {
      cart = await prisma.cart.findUnique({
        where: { sessionId },
      });
    }

    if (!cart) {
      return res.json({ message: 'Cart already empty' });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    return next(error);
  }
};
