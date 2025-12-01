import { auth } from '@/auth';

export async function requireAuth() {
  const session = await auth();
  if (!session) {
    throw Object.assign(new Error('Unauthorized'), { status: 401 });
  }
  return session.user;
}