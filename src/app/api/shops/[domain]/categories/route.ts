import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import CategoryService from '@/services/category.service';

export const GET = errorHandler(async (_, { params }) => {
  const { domain } = await params;
  const categories = await CategoryService.getShopCategories(domain!);

  return NextResponse.json(categories);
});

export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  const { name } = await request.json();

  const category = await CategoryService.createCategory({ name, domain: domain! });
  return NextResponse.json(category, { status: 201 });
});
