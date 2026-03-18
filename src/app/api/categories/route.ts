import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import CategoryService from '@/services/category.service';

export const GET = errorHandler(async () => {
  const categories = await CategoryService.getAllCategories();

  return NextResponse.json(categories);
});

export const POST = errorHandler(async (request) => {
  const body = await request.json();

  const category = await CategoryService.createCategory(body);
  return NextResponse.json(category, { status: 201 });
});
