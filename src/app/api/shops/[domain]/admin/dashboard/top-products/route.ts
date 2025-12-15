import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Shop } from '@/models/Shop';
import { Product } from '@/models/Product';

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = params;
    const shop = await Shop.findByDomain(domain);
    
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

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
  } catch (error) {
    console.error('Error fetching top products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
