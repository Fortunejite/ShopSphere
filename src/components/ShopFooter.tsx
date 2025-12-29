'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram,
  Store,
  Shield,
  Truck,
  Clock,
  Heart,
  Sun,
  Moon
} from 'lucide-react';
import { ShopWithOwner } from '@/models/Shop';

interface ShopFooterProps {
  shop: ShopWithOwner;
}

export default function ShopFooter({ shop }: ShopFooterProps) {
  const currentYear = new Date().getFullYear();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for saved theme preference or default to system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <footer className="bg-neutral-900 border-t border-neutral-800">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Shop Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {shop.logo ? (
                <Image 
                  src={shop.logo} 
                  alt={`${shop.name} logo`}
                  width={40}
                  height={40}
                  className="w-10 h-10 object-cover rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-neutral-400" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white">{shop.name}</h3>
                {shop.description && (
                  <p className="text-sm text-neutral-400 line-clamp-2">{shop.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href={`/shops/${shop.domain}`}
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href={`/products`}
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link 
                  href={`/cart`}
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link 
                  href={`/orders`}
                  className="text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  Track Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Contact Us</h4>
            <div className="space-y-3">
              {shop.email && (
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <a 
                    href={`mailto:${shop.email}`}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {shop.email}
                  </a>
                </div>
              )}
              {shop.phone && (
                <div className="flex items-center space-x-3 text-sm">
                  <Phone className="w-4 h-4 text-neutral-500" />
                  <a 
                    href={`tel:${shop.phone}`}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {shop.phone}
                  </a>
                </div>
              )}
              {(shop.address || shop.city || shop.state) && (
                <div className="flex items-start space-x-3 text-sm">
                  <MapPin className="w-4 h-4 text-neutral-500 mt-0.5" />
                  <div className="text-neutral-400">
                    {shop.address && <div>{shop.address}</div>}
                    {(shop.city || shop.state) && (
                      <div>
                        {shop.city}{shop.city && shop.state && ', '}{shop.state}
                        {shop.postal_code && ` ${shop.postal_code}`}
                      </div>
                    )}
                    {shop.country && <div>{shop.country}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features & Trust */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Why Choose Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-neutral-400">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Truck className="w-4 h-4 text-blue-400" />
                <span className="text-neutral-400">
                  {shop.free_shipping_threshold 
                    ? `Free shipping over ${shop.currency === 'USD' ? '$' : shop.currency}${shop.free_shipping_threshold}`
                    : 'Fast Delivery'
                  }
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-neutral-400">24/7 Support</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-neutral-400">Customer Satisfaction</span>
              </div>
            </div>

            {/* Social Media Links (placeholder) */}
            <div className="pt-4">
              <h5 className="text-xs font-medium text-neutral-300 mb-3">Follow Us</h5>
              <div className="flex space-x-3">
                <a 
                  href="#" 
                  className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4 text-neutral-400" />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4 text-neutral-400" />
                </a>
                <a 
                  href="#" 
                  className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 text-neutral-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-neutral-800 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              © {currentYear} {shop.name}. All rights reserved. 
              <span className="ml-1">Powered by <span className="font-medium text-white">ShopSphere</span>.</span>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
