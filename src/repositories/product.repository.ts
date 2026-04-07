import { prisma } from '@/lib/prisma';
import { Prisma, Product } from '@prisma/client';

interface FindProductsProps {
  where: Prisma.ProductWhereInput;
  orderBy?: Prisma.ProductOrderByWithRelationInput[];
  take?: number;
  skip?: number;
}

const include = {
  shop: { select: { name: true, domain: true } },
  categories: { select: { name: true } },
};

export const findMany = async (params: FindProductsProps) => {
  return await prisma.product.findMany({
    where: params.where,
    orderBy: params.orderBy,
    take: params.take,
    skip: params.skip,
    include,
  });
};

export const findOne = async (where: Prisma.ProductWhereInput) => {
  return await prisma.product.findFirst({
    where,
  });
};

export const findUnique = async (where: Prisma.ProductWhereUniqueInput) => {
  return await prisma.product.findUnique({
    where,
  });
};

export const count = async (where: Prisma.ProductWhereInput) => {
  return await prisma.product.count({ where });
};

export const create = async (data: Prisma.ProductCreateInput) => {
  return await prisma.product.create({
    data,
    include,
  });
};

export const update = async (
  id: Product['id'],
  data: Prisma.ProductUpdateInput,
) => {
  return await prisma.product.update({
    where: { id },
    data,
  });
};

export const deleteById = async (id: Product['id']) => {
  return await prisma.product.delete({
    where: { id },
  });
};
