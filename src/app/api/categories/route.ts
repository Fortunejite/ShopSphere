import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Category } from '@/models/Category';
import { errorHandler } from '@/lib/errorHandler';
import slugify from 'slugify';

export const GET = errorHandler(async () => {
  const categories = await Category.findAll();

  return NextResponse.json(categories);
});

export const POST = errorHandler(async (request) => {
  const session = await auth();
  if (!session)
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { name, parent_id } = await request.json();

  const { user } = session;

  if (!user || user.role !== 'admin')
    return NextResponse.json(
      { message: 'Insufficient Permission' },
      { status: 403 },
    );
  const slug = slugify(name, { lower: true, strict: true });
  const category = await Category.create({ name, slug, parent_id });
  return NextResponse.json(category, { status: 201 });
});
