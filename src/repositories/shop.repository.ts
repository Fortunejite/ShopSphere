import { prisma } from "@/lib/prisma";
import { Prisma, Shop } from "@prisma/client";

const includeShopRelations = {
  owner: { select: { email: true, username: true } },
};

export const findById = async (id: Shop['id']) => {
  return await prisma.shop.findUnique({
    where: {
      id
    },
    include: includeShopRelations
  });
};

export const findByOwnerId = async (ownerId: Shop['owner_id']) => {
  return await prisma.shop.findMany({
    where: {
      owner_id: ownerId
    },
    include: includeShopRelations
  });
};

export const findByDomain = async (domain: Shop['domain']) => {
  return await prisma.shop.findUnique({
    where: {
      domain
    },
    include: includeShopRelations
  });
};

export const create = async (data: Prisma.ShopCreateInput) => {
  return await prisma.shop.create({
    data,
  });
};

export const update = async (id: Shop['id'], data: Prisma.ShopUpdateInput) => {
  return await prisma.shop.update({
    where: {
      id
    },
    data,
  });
};

export const remove = async (id: Shop['id']) => {
  return await prisma.shop.delete({
    where: {
      id
    },
  });
};
