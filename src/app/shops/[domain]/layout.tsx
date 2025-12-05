'use client';

import { notFound, useParams } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  Store,
  Clock,
  AlertTriangle,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import { fetchShop } from '@/redux/shopSlice';
import { ShopWithOwner } from '@/models/Shop';
import ShopNavbar from '@/components/ShopNavbar';

const ShopUnavailable = ({ shop }: { shop: ShopWithOwner }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      {/* Simple navbar for unavailable shop */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-neutral-300 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-neutral-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-700">{shop?.name || 'Shop'}</h1>
              <p className="text-xs text-neutral-500">{shop?.domain}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-neutral-900">Shop Temporarily Unavailable</h2>
            <p className="text-neutral-600 leading-relaxed">
              This shop is currently undergoing maintenance or setup. Please check back later or contact the shop owner for more information.
            </p>
          </div>

          {/* Status badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 px-4 py-2">
              <AlertTriangle className="w-3 h-3 mr-2" />
              {shop?.status || 'Inactive'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button className="flex-1" asChild>
              <Link href="/shops">
                <Store className="w-4 h-4 mr-2" />
                Browse Other Shops
              </Link>
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-sm text-neutral-500 pt-8">
            Shop powered by <span className="font-medium">ShopSphere</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { domain } = useParams();

  const dispatch = useAppDispatch();
  const { status, shop } = useAppSelector((s) => s.shop);

  useEffect(() => {
    if (domain) {
      dispatch(fetchShop(domain as string));
    }
  }, [dispatch, domain]);

  if (status === 'failed') return notFound();
  if (status === 'loading' || !shop) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-neutral-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (shop.status !== 'active') {
    return <ShopUnavailable shop={shop} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <ShopNavbar shop={shop} />
      <main>{children}</main>
    </div>
  );
}
