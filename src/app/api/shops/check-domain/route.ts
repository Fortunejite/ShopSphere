import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import ShopService from '@/services/shop.service';

export const GET = errorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json(
      { message: 'Domain parameter is required' },
      { status: 400 }
    );
  }
  
  const isAvailable = await ShopService.isDomainAvailable(domain);

  return NextResponse.json({
    available: isAvailable,
    message: isAvailable ? 'Domain is available' : 'Domain is already taken'
  });
});
