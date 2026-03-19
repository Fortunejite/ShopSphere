import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import ProductService from '@/services/product.service';

export const GET = errorHandler(async (_, { params }) => {
  const { slug, domain } = await params;
  if (!slug || !domain) {
    return NextResponse.json(
      { message: 'Product Slug and Shop Domain are required' },
      { status: 400 },
    );
  }
  const product = await ProductService.getProductBySlug(slug, domain);
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
  
  const body = await request.json();
  const updatedProduct = await ProductService.updateProductBySlug(slug, domain, body);
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
  
  const product = await ProductService.deleteProductBySlug(slug, domain);
  return NextResponse.json({ product, message: 'Product deleted successfully' });
});
