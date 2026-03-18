import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';

export const findAll = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  return categories;
};

export const countCategories = async (categoryIds?: Category['id'][]) => {
  const where = categoryIds ? { id: { in: categoryIds } } : {};
  return await prisma.category.count({ where });
};

export const create = async (data: {
  name: Category['name'];
  slug: Category['slug'];
  parent_id?: Category['parent_id'];
}) => {
  const category = await prisma.category.create({
    data,
  });
  return category;
};
