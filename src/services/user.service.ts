import bcrypt from 'bcrypt';
import z from 'zod';
import { auth, signIn } from '@/auth';
import {
  createUserSchema,
  loginUserSchema,
  updateProfileSchema,
} from '@/lib/schema/auth';
import {
  create,
  findByEmail,
  findById,
  findByUsername,
  updateById,
} from '@/repositories/user.repository';

export const registerUser = async (data: z.infer<typeof createUserSchema>) => {
  const { password, ...credentials } = createUserSchema.parse(data);

  const availableUser = await findByEmail(credentials.email);

  if (availableUser) {
    throw {
      error: 'EmailAlreadyExist',
      message: 'Email already exists',
      status: 400,
    };
  }

  const password_hash = await bcrypt.hash(password, 10);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash: _, ...safeUser } = await create({
    ...credentials,
    password_hash,
  });
  await signIn('credentials', { ...credentials, password, redirect: false });

  return safeUser;
};

export const loginUser = async (data: z.infer<typeof loginUserSchema>) => {
  const { email, password } = loginUserSchema.parse(data);

  const user = await findByEmail(email);
  if (!user) {
    return null;
  }

  const { password_hash, ...safeUser } = user;

  const isValid = await bcrypt.compare(password, password_hash);
  if (!isValid) return null;
  return safeUser;
};

export const authorizeUser = async () => {
  const session = await auth();
  if (!session) {
    throw { message: 'Unauthorized', status: 401 };
  }
  return session.user;
};

export const getUserProfile = async () => {
  const { id } = await authorizeUser();
  const user = await findById(id);
  if (!user) {
    throw { message: 'User not found', status: 404 };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash: _, ...safeUser } = user;
  return safeUser;
};

export const updateUserProfile = async (
  data: z.infer<typeof updateProfileSchema>,
) => {
  const user = await authorizeUser();
  const userData = updateProfileSchema.parse(data);
  const existingUser = await findById(user.id);
  if (!existingUser) {
    throw { message: 'User not found', status: 404 };
  }

  // Check if username is already taken (if username is being updated)
  if (userData.username && userData.username !== existingUser.username) {
    const usernameExists = await findByUsername(userData.username);
    if (usernameExists && usernameExists.id !== user.id) {
      throw { message: 'Username already taken', status: 409 };
    }
  }

  const updatedUser = await updateById(user.id, userData);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash: _, ...safeUser } = updatedUser;

  return safeUser;
};
