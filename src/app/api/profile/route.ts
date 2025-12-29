import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import { z } from 'zod';
import { requireAuth } from '@/lib/apiAuth';
import { errorHandler } from '@/lib/errorHandler';

// Validation schema for profile updates
const updateProfileSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').max(50, 'Username must be less than 50 characters').optional(),
  phone_number: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number must be less than 20 characters').optional(),
  address: z.string().max(255, 'Address must be less than 255 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
});

// GET /api/profile - Get current user's profile
export const GET = errorHandler(async () => {
  const { id: userId } = await requireAuth();

  const user = await User.findById(userId);
  
  if (!user) {
    return NextResponse.json(
      { message: 'User not found' },
      { status: 404 }
    );
  }

  // Remove sensitive information
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...safeUser } = user;
  
  return NextResponse.json(safeUser);
});

// PUT /api/profile - Update current user's profile
export const PUT = errorHandler(async (request) => {
  const { id: userId } = await requireAuth();

  const body = await request.json();
  
  // Validate request body
  const validationResult = updateProfileSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { 
        message: 'Validation error',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      },
      { status: 400 }
    );
  }
  
  // Check if user exists
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    return NextResponse.json(
      { message: 'User not found' },
      { status: 404 }
    );
  }

  // Check if username is already taken (if username is being updated)
  if (validationResult.data.username && validationResult.data.username !== existingUser.username) {
    const usernameExists = await User.findByUsername(validationResult.data.username);
    if (usernameExists && usernameExists.id !== userId) {
      return NextResponse.json(
        { message: 'Username already taken' },
        { status: 409 }
      );
    }
  }

  // Update user profile
  const updatedUser = await User.update(userId, validationResult.data);
  
  // Remove sensitive information
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...safeUser } = updatedUser;
  
  return NextResponse.json({
    message: 'Profile updated successfully',
    user: safeUser
  });
});
