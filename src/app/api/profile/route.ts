import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/apiAuth';
import { errorHandler } from '@/lib/errorHandler';
import { getUserProfile, updateUserProfile } from '@/services/user.service';

// GET /api/profile - Get current user's profile
export const GET = errorHandler(async () => {
  const { id: userId } = await requireAuth();

  const user = await getUserProfile(userId);

  return NextResponse.json(user);
});

// PUT /api/profile - Update current user's profile
export const PUT = errorHandler(async (request) => {
  const { id: userId } = await requireAuth();

  const body = await request.json();
  const user = await updateUserProfile(userId, body);

  return NextResponse.json({
    message: 'Profile updated successfully',
    user,
  });
});
