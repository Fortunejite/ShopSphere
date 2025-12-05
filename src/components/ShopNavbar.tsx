import { ShopWithOwner } from '@/models/Shop';
import {
  Store,
  Home,
  Package,
  ShoppingCart,
  Search,
  Heart,
  Badge,
  User,
  Menu,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Link from 'next/link';

const ShopNavbar = ({ shop }: { shop: ShopWithOwner }) => {
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Shop Name */}
          <div className="flex items-center space-x-4">
            <Link
              href={`/${shop.domain}`}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">
                  {shop.name}
                </h1>
                <p className="text-xs text-neutral-500">{shop.domain}</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href={`/${shop.domain}`}
              className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Home
            </Link>
            <Link
              href={`/${shop.domain}/products`}
              className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
            >
              <Package className="w-4 h-4 inline mr-2" />
              Products
            </Link>
            <Link
              href={`/${shop.domain}/cart`}
              className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
            >
              <ShoppingCart className="w-4 h-4 inline mr-2" />
              Cart
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full border-neutral-200 focus:border-neutral-400"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Wishlist */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Heart className="w-4 h-4" />
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="w-4 h-4" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-neutral-900 text-white">
                0
              </Badge>
            </Button>

            {/* Account */}
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <User className="w-4 h-4 mr-2" />
              Account
            </Button>

            {/* Mobile Menu */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Search - Below main nav */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full border-neutral-200"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ShopNavbar