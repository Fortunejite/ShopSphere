import { prisma } from '@/lib/prisma';
import { Category, Prisma } from '@prisma/client';

export const find = async (shopId: number) => {
  const categories = await prisma.category.findMany({
    where: { shop_id: shopId },
    orderBy: { name: 'asc' },
  });
  return categories;
};

export const countCategories = async (categoryIds?: Category['id'][]) => {
  const where = categoryIds ? { id: { in: categoryIds } } : {};
  return await prisma.category.count({ where });
};

export const create = async (data: Prisma.CategoryCreateInput) => {
  const category = await prisma.category.create({
    data,
  });
  return category;
};

export const findByIdAndShop = async (id: Category['id'], shopId: number) => {
  return await prisma.category.findFirst({
    where: { id, shop_id: shopId },
  });
};

export const updateCategory = async (
  id: Category['id'],
  data: Prisma.CategoryUpdateInput,
) => {
  return await prisma.category.update({
    where: { id },
    data,
  });
};

export const deleteCategory = async (id: Category['id']) => {
  await prisma.category.delete({ where: { id } });
}
