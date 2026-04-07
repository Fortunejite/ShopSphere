import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const include = {
  user: { select: { email: true, username: true } },
};

export const count = async (where: Prisma.OrderWhereInput) => {
  return await prisma.order.count({ where });
};

export const findMany = async (where: Prisma.OrderWhereInput, take: number, skip: number) => {
  return await prisma.order.findMany({
    where,
    take,
    skip,
    include,
    orderBy: { created_at: 'desc' },
  });
};

export const findUnique = async (where: Prisma.OrderWhereUniqueInput) => {
  return await prisma.order.findUnique({
    where,
  });
};

export const create = async (data: Prisma.OrderCreateInput) => {
  return await prisma.order.create({
    data,
  });
}

export const update = async (id: number, data: Prisma.OrderUpdateInput) => {
  return await prisma.order.update({
    where: { id },
    data,
  });
};
