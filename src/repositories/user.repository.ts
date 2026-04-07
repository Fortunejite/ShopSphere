import { prisma } from '@/lib/prisma';
import { User, Prisma } from '@prisma/client';

export const findByEmail = async (email: User['email']) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};

export const findByUsername = async (username: User['username']) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user;
};

export const findById = async (id: User['id']) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
};

export const create = async (data: Prisma.UserCreateInput) => {
  const user = await prisma.user.create({
    data,
  });
  return user;
};

export const updateById = async (
  id: User['id'],
  data: Prisma.UserUpdateInput,
) => {
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return user;
};
