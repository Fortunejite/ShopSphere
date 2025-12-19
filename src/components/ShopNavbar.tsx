'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShopWithOwner } from '@/models/Shop';
import {
  Store,
  Home,
  Package,
  ShoppingCart,
  Search,
  Heart,
  User,
  Menu,
  LogIn,
  Shield,
  Settings,
  BarChart3,
  Bell,
  X,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { CartWithProducts } from '@/models/Cart';
import { cn } from '@/lib/utils';

interface Props {
  cart: CartWithProducts | null;
  shop: ShopWithOwner;
}

const ShopNavbar = ({ shop, cart }: Props) => {
  const { data: session } = useSession();
  const user = session?.user;
  const isShopAdmin = user?.id === shop.owner_id;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
            <Link href='/' className="flex items-center space-x-4">
              <div className="relative w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center overflow-hidden">
                {shop.logo ? (
                  <Image
                    src={shop.logo}
                    alt={shop.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Store className="w-8 h-8 text-white" />
                )}
              </div>
            </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link
              href='/'
              className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
            <Link
              href='/products'
              className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center"
            >
              <Package className="w-4 h-4 mr-2" />
              Products
            </Link>
            {user && (
              <Link
                href='/orders'
                className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                My Orders
              </Link>
            )}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-full border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Admin Panel Quick Access */}
            {isShopAdmin && (
              <div className="hidden lg:flex items-center space-x-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin">
                    <BarChart3 className="w-4 h-4" />
                    <span className="sr-only">Dashboard</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/orders">
                    <Bell className="w-4 h-4" />
                    <span className="sr-only">Orders</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/settings">
                    <Settings className="w-4 h-4" />
                    <span className="sr-only">Settings</span>
                  </Link>
                </Button>
              </div>
            )}

            {/* Wishlist - Only for logged in users */}
            {user && (
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Heart className="w-4 h-4" />
                <span className="sr-only">Wishlist</span>
              </Button>
            )}

            {/* Cart */}
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="w-4 h-4" />
                {cart && cart.items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-blue-600 text-white">
                    {cart.items.length}
                  </Badge>
                )}
                <span className="sr-only">Shopping cart</span>
              </Link>
            </Button>

            {/* User Menu */}
            {!user ? (
              <div className="hidden sm:flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">
                    Sign Up
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hidden sm:flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-20 truncate">{user.username || user.email}</span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform", isUserMenuOpen && "rotate-180")} />
                </Button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="font-medium text-sm text-neutral-900">{user.username}</p>
                      <p className="text-xs text-neutral-600">{user.email}</p>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    
                    <Link
                      href="/orders"
                      className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      My Orders
                    </Link>

                    {isShopAdmin && (
                      <>
                        <div className="border-t border-neutral-100 my-1" />
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                        <Link
                          href="/admin/products"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Manage Products
                        </Link>
                        <Link
                          href="/admin/orders"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Manage Orders
                        </Link>
                      </>
                    )}

                    <div className="border-t border-neutral-100 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search - Always visible on mobile */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full border-neutral-200"
            />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href='/'
                className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4 mr-3" />
                Home
              </Link>
              <Link
                href='/products'
                className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Package className="w-4 h-4 mr-3" />
                Products
              </Link>
              
              {user ? (
                <>
                  <Link
                    href='/orders'
                    className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-3" />
                    My Orders
                  </Link>
                  <Link
                    href='/profile'
                    className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Link>
                  
                  {isShopAdmin && (
                    <>
                      <div className="border-t border-neutral-200 pt-4 mt-4">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                          Admin
                        </p>
                      </div>
                      <Link
                        href='/admin'
                        className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      <Link
                        href='/admin/products'
                        className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-3" />
                        Manage Products
                      </Link>
                      <Link
                        href='/admin/orders'
                        className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        Manage Orders
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center w-full text-left"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-3 border-t border-neutral-200 pt-4 mt-4">
                  <Link
                    href='/login'
                    className="text-neutral-700 hover:text-neutral-900 font-medium transition-colors flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4 mr-3" />
                    Login
                  </Link>
                  <Link
                    href='/signup'
                    className="bg-neutral-900 text-white px-4 py-2 rounded-md font-medium inline-block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default ShopNavbar