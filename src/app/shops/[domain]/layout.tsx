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
import ShopFooter from '@/components/ShopFooter';
import ShopTheme from '@/components/ShopTheme';
import { PageLoading } from '@/components/Loading';
import { fetchCart, setCartAuthenticationStatus } from '@/redux/cartSlice';
import { useSession } from 'next-auth/react';

const ShopUnavailable = ({ shop }: { shop: ShopWithOwner }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Simple navbar for unavailable shop */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{shop?.name || 'Shop'}</h1>
              <p className="text-xs text-muted-foreground">{shop?.domain}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-secondary-foreground" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">Shop Temporarily Unavailable</h2>
            <p className="text-muted-foreground leading-relaxed">
              This shop is currently undergoing maintenance or setup. Please check back later or contact the shop owner for more information.
            </p>
          </div>

          {/* Status badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground px-4 py-2">
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
          <p className="text-sm text-muted-foreground pt-8">
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
  const { status: sessionStatus } = useSession();
  const { status, shop } = useAppSelector((s) => s.shop);
  const { cart } = useAppSelector((s) => s.cart);

  useEffect(() => {
    if (domain) {
      dispatch(fetchShop(domain as string));
    }
  }, [dispatch, domain]);

  useEffect(() => {
    if (!domain || sessionStatus === 'loading') return;
    const userIsAuthenticated = sessionStatus === 'authenticated';
    dispatch(setCartAuthenticationStatus(userIsAuthenticated));
    dispatch(fetchCart(domain as string));
  }, [dispatch, domain, sessionStatus]);

  if (status === 'failed') return notFound();
  if (status === 'loading' || !shop) {
    return <PageLoading text="Loading shop..." variant="shop" />;
  }

  if (shop.status !== 'active') {
    return <ShopUnavailable shop={shop} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ShopTheme shop={shop} />
      <ShopNavbar shop={shop} cart={cart} />
      <main className="flex-1">{children}</main>
      <ShopFooter shop={shop} />
    </div>
  );
}
