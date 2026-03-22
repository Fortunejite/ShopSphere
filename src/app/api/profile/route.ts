import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import { getUserProfile, updateUserProfile } from '@/services/user.service';

// GET /api/profile - Get current user's profile
export const GET = errorHandler(async () => {
  const user = await getUserProfile();

  return NextResponse.json(user);
});

// PUT /api/profile - Update current user's profile
export const PUT = errorHandler(async (request) => {
  const body = await request.json();
  const user = await updateUserProfile(body);

  return NextResponse.json({
    message: 'Profile updated successfully',
    user,
  });
});
