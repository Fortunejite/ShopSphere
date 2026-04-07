import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import ProductService from '@/services/product.service';

export const GET = errorHandler(async (request, { params }) => {
  const { searchParams } = new URL(request.url);
  const { domain } = await params;

  if (!domain) {
    return NextResponse.json(
      { message: 'Shop domain is required' },
      { status: 400 },
    );
  }

  const response = await ProductService.getProductsByShopDomain(
    domain,
    Object.fromEntries(searchParams.entries()),
  );

  return NextResponse.json(response);
});

export const POST = errorHandler(async (request, { params }) => {
  const { domain } = await params;
  const body = await request.json();

  if (!domain) {
    return NextResponse.json(
      { message: 'Shop domain is required' },
      { status: 400 },
    );
  }

  const product = await ProductService.createProduct(domain, body);
  return NextResponse.json(
    { message: 'Product created successfully', product },
    { status: 201 },
  );
});
