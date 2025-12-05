import { NextResponse } from 'next/server';

import { Product } from '@/models/Product';

import { errorHandler } from '@/lib/errorHandler';
import { getShopByDomain } from '@/lib/shop';
import { requireAuth } from '@/lib/apiAuth';
import { updateProductSchema } from '@/lib/schema/product';

export const GET = errorHandler(async (_, { params }) => {
  const { slug, domain } = await params;
  if (!slug || !domain) {
    return NextResponse.json(
      { message: 'Product Slug and Shop Domain are required' },
      { status: 400 },
    );
  }

  const shop = await getShopByDomain(domain);

  const product = await Product.findByShopAndSlug(shop.id, slug);
  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
});

export const PUT = errorHandler(async (request, { params }) => {
  const { slug, domain } = await params;
  if (!slug || !domain) {
    return NextResponse.json(
      { message: 'Product Slug and Shop Domain are required' },
      { status: 400 },
    );
  }

  const shop = await getShopByDomain(domain);

  const product = await Product.findByShopAndSlug(shop.id, slug);
  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  const user = await requireAuth();
  if (shop.owner_id !== user.id) {
    return NextResponse.json(
      { message: 'Unauthorized to update this product' },
      { status: 403 },
    );
  }

  const body = await request.json();
  const validationResult = updateProductSchema.safeParse(body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return NextResponse.json(
      {
        message: 'Invalid product data',
        errors
      },
      { status: 400 }
    );
  }

  const updatedProduct = await Product.update(product.id, validationResult.data);
  return NextResponse.json(updatedProduct);
});

export const DELETE = errorHandler(async (_, { params }) => {
  const { slug, domain } = await params;
  if (!slug || !domain) {
    return NextResponse.json(
      { message: 'Product Slug and Shop Domain are required' },
      { status: 400 },
    );
  }

  const shop = await getShopByDomain(domain);

  const product = await Product.findByShopAndSlug(shop.id, slug);
  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  const user = await requireAuth();
  if (shop.owner_id !== user.id) {
    return NextResponse.json(
      { message: 'Unauthorized to delete this product' },
      { status: 403 },
    );
  }

  await Product.delete(product.id);
  return NextResponse.json({ message: 'Product deleted successfully' });
});
