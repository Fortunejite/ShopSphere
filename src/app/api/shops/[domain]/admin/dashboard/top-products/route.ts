import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Product } from '@/models/Product';
import { getShopByDomain } from '@/lib/shop';
import { errorHandler } from '@/lib/errorHandler';

export const GET = errorHandler(async (req, { params }) => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { domain } = await params;
  if (!domain) {
    throw Object.assign(new Error('Shop domain is required'), { status: 400 });
  }
  const shop = await getShopByDomain(domain);
  // Check if user is shop owner
  if (shop.owner_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Use existing method from Product model
  const topProducts = await Product.findBestSelling(5, shop.id);

  // Format the response to match the expected interface
  const formattedProducts = topProducts.map(product => ({
    id: product.id,
    name: product.name,
    image: product.image || '/placeholder.png',
    sales_count: product.sales_count || 0,
    revenue: (product.sales_count || 0) * parseFloat(product.price.toString())
  }));

  return NextResponse.json(formattedProducts);  
})
