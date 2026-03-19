import { prisma } from '@/lib/prisma';
import { CartItem } from '@/types';
import { Cart, Prisma } from '@prisma/client';

interface CartWithItems extends Omit<Cart, 'items'> {
  items: CartItem[];
}

export const findUnique = async (where: Prisma.CartWhereUniqueInput) => {
  const cart = await prisma.cart.findUnique({
    where,
  });

  return cart as CartWithItems | null;
};

export const upsert = async ({
  where,
  create,
  update,
}: {
  where: Prisma.CartWhereUniqueInput;
  create: Prisma.CartCreateInput;
  update: Prisma.CartUpdateInput;
}) => {
  const cart = await prisma.cart.upsert({
    where,
    create,
    update,
  });

  return cart;
};

export const update = async (
  where: Prisma.CartWhereUniqueInput,
  data: Prisma.CartUpdateInput,
) => {
  const cart = await prisma.cart.update({
    where,
    data,
  });

  return cart;
};