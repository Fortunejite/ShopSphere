'use client';

import { useAppSelector } from '@/hooks/redux.hook';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Star, 
  ArrowRight,
  Package,
  Truck,
  Shield,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function ShopHomePage() {
  const { shop } = useAppSelector((s) => s.shop);

  if (!shop) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            {shop.category || 'Online Store'}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Welcome to {shop.name}
          </h1>
          
          <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {shop.description || 'Discover amazing products and great deals in our carefully curated collection.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href={`/shops/${shop.domain}/products`}>
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Now
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8">
              Learn More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Why Shop With Us?
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              We&apos;re committed to providing you with the best shopping experience possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Quality Products</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Carefully selected high-quality products that meet our strict standards.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Fast Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Quick and reliable shipping to get your orders to you as fast as possible.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Secure Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your payment information is protected with industry-standard security.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our customer support team is here to help you anytime you need assistance.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Placeholder */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Featured Products
            </h2>
            <p className="text-neutral-600">
              Check out our most popular items
            </p>
          </div>

          {/* Placeholder for products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="group hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader className="p-0">
                  <div className="aspect-square bg-neutral-200 rounded-t-lg flex items-center justify-center">
                    <Package className="w-12 h-12 text-neutral-400" />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">Product {item}</CardTitle>
                  <CardDescription className="mb-3">
                    Sample product description goes here.
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-neutral-900">
                      {shop.currency === 'USD' ? '$' : shop.currency} 99.99
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-neutral-600">4.5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href={`/shops/${shop.domain}/products`}>
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            Join thousands of satisfied customers and discover what makes us special.
          </p>
          <Button size="lg" className="text-lg px-8 bg-white text-neutral-900 hover:bg-neutral-100" asChild>
            <Link href={`/shops/${shop.domain}/products`}>
              <ShoppingBag className="w-5 h-5 mr-2" />
              Start Shopping
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-neutral-600">
            © 2024 {shop.name}. Powered by <span className="font-medium">ShopSphere</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}
