import { prisma } from "./prisma";

export const getShopByDomain = async (domain: string) => {
  const shop = await prisma.shop.findUnique({
    where: { domain },
    include: {
      owner: { select: { email: true, username: true } },
      category: true,
    },
  });
  if (!shop) {
    throw Object.assign(new Error('Shop not found'), { status: 404 });
  }
  return shop;
}

export const getShopById = async (shopId: number) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      owner: { select: { email: true, username: true } },
      category: true,
    },
  });
  if (!shop) {
    throw Object.assign(new Error('Shop not found'), { status: 404 });
  }
  return shop;
}