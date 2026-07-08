import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { logAdminAction } from '../utils/adminLogger';
export const listCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true 
              }
            }
          }
        },
      },
      where: {
        parentId: null 
      }
    });
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
};
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, parentId } = req.body;
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const existingSlug = await prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId: parentId || null
      },
    });
    await logAdminAction((req as any).user.id, 'CREATE_CATEGORY', `Created category: ${category.name} (${category.id})`, req.ip);
    return res.status(201).json(category);
  } catch (error) {
    return next(error);
  }
};
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description, parentId } = req.body;
    const existingCategory = await prisma.category.findUnique({ where: { id } });
    if (!existingCategory) return res.status(404).json({ message: 'Category not found' });
    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const existingSlug = await prisma.category.findUnique({ where: { slug } });
      if (existingSlug && existingSlug.id !== id) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingCategory.name,
        slug,
        description: description !== undefined ? description : existingCategory.description,
        parentId: parentId !== undefined ? parentId : existingCategory.parentId
      },
    });
    await logAdminAction((req as any).user.id, 'UPDATE_CATEGORY', `Updated category: ${updatedCategory.name} (${updatedCategory.id})`, req.ip);
    return res.json(updatedCategory);
  } catch (error) {
    return next(error);
  }
};
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: { products: true, children: true },
    });
    if (!existingCategory) return res.status(404).json({ message: 'Category not found' });
    if (existingCategory.products.length > 0) {
      return res.status(400).json({ message: `Cannot delete category. It contains ${existingCategory.products.length} products.` });
    }
    if (existingCategory.children.length > 0) {
      return res.status(400).json({ message: `Cannot delete category. It has ${existingCategory.children.length} subcategories. Delete them first.` });
    }
    await prisma.category.delete({ where: { id } });
    await logAdminAction((req as any).user.id, 'DELETE_CATEGORY', `Deleted category: ${existingCategory.name} (${existingCategory.id})`, req.ip);
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
