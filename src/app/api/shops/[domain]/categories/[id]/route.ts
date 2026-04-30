import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import CategoryService from '@/services/category.service';

export const PUT = errorHandler(async (request, { params }) => {
  const { domain, id } = await params;

  if (!id || !domain) {
    return NextResponse.json(
      { message: 'Category ID and Shop Domain are required' },
      { status: 400 },
    );
  }

  const { name } = await request.json();
  const categoryId = Number(id);

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json(
      { message: 'Category name must be at least 2 characters' },
      { status: 400 },
    );
  }

  if (Number.isNaN(categoryId)) {
    return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
  }

  const category = await CategoryService.updateCategory(categoryId, {
    name: name.trim(),
    domain,
  });

  return NextResponse.json(category);
});

export const DELETE = errorHandler(async (_, { params }) => {
  const { domain, id } = await params;

  if (!id || !domain) {
    return NextResponse.json(
      { message: 'Category ID and Shop Domain are required' },
      { status: 400 },
    );
  }

  const categoryId = Number(id);

  if (Number.isNaN(categoryId)) {
    return NextResponse.json({ message: 'Invalid category ID' }, { status: 400 });
  }

  await CategoryService.deleteCategory(categoryId, domain);
  return NextResponse.json({ message: 'Category deleted successfully' });
});
