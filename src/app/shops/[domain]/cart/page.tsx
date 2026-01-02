'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  Package,
  Truck,
  CreditCard,
  Heart,
  ShoppingBag,
  Lock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import {
  updateCartItem,
  removeFromCart,
  selectCart,
  selectCartStatus,
  selectCartError,
  selectCartItemCount,
  selectCartTotal,
} from '@/redux/cartSlice';
import { cn } from '@/lib/utils';
import { CartItemWithProduct } from '@/models/Cart';
import { formatCurrency } from '@/lib/currency';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const cart = useAppSelector(selectCart);
  const cartStatus = useAppSelector(selectCartStatus);
  const cartError = useAppSelector(selectCartError);
  const itemCount = useAppSelector(selectCartItemCount);
  const cartTotal = useAppSelector(selectCartTotal);

  const { shop } = useAppSelector((state) => state.shop);

  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize quantities from cart
    if (cart?.items) {
      const initialQuantities: Record<string, number> = {};
      cart.items.forEach((item) => {
        const key = `${item.product_id}-${item.variant_index || 'none'}`;
        initialQuantities[key] = item.quantity;
      });
      setQuantities(initialQuantities);
    }
  }, [cart?.items]);

  const getItemKey = (productId: number, variantIndex?: number) => {
    return `${productId}-${variantIndex || 'none'}`;
  };

  const handleQuantityChange = async (
    productId: number,
    newQuantity: number,
    variantIndex?: number,
  ) => {
    if (!shop?.domain) return;

    const key = getItemKey(productId, variantIndex);
    setIsUpdating(key);

    // Update local state immediately for better UX
    setQuantities((prev) => ({ ...prev, [key]: newQuantity }));

    try {
      await dispatch(
        updateCartItem({
          shopDomain: shop.domain,
          product_id: productId,
          quantity: newQuantity,
          variant_index:
            typeof variantIndex === 'number' ? variantIndex : undefined,
        }),
      ).unwrap();
    } catch {
      // Revert local change on error
      if (cart?.items) {
        const originalItem = cart.items.find(
          (item) =>
            item.product_id === productId &&
            item.variant_index === variantIndex,
        );
        if (originalItem) {
          setQuantities((prev) => ({ ...prev, [key]: originalItem.quantity }));
        }
      }
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: number, variantIndex?: number) => {
    if (!shop?.domain) return;

    const key = getItemKey(productId, variantIndex);
    setIsUpdating(key);

    try {
      await dispatch(
        removeFromCart({
          shopDomain: shop.domain,
          product_id: productId,
          variant_index: typeof variantIndex === 'number' ? variantIndex : undefined,
        }),
      ).unwrap();
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getVariantDisplayText = (item: CartItemWithProduct) => {
    if (item.variant_index === undefined || !item.product.variants?.[item.variant_index]) {
      return null;
    }

    const variant = item.product.variants[item.variant_index];
    return Object.entries(variant.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const getItemPrice = (item: CartItemWithProduct) => ({
    price: item.product.price,
    discount: item.product.discount || 0,
  });

  if (cartStatus === 'loading' && !cart) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{cartError}</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Shopping Cart
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-sm sm:text-base text-muted-foreground">Total:</span>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <span className="text-lg sm:text-xl font-semibold">
                  {formatCurrency(cartTotal, shop!.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isEmpty ? (
          // Empty Cart State
          <div className="text-center py-12 sm:py-16">
            <ShoppingBag className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto px-4">
              Looks like you haven&apos;t added any items to your cart yet.
              Start shopping to fill it up!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button onClick={() => router.push(`/products`)} className="px-8">
                <Package className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                    Cart Items ({itemCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.items.map((item) => {
                    const key = getItemKey(item.product_id, item.variant_index);
                    const pricing = getItemPrice(item);
                    const isItemUpdating = isUpdating === key;
                    const currentQuantity = quantities[key] || item.quantity;
                    const totalStock = item.product.stock_quantity;
                    const variantText = getVariantDisplayText(item);
                    const finalPrice =
                      pricing.price * (1 - pricing.discount / 100);

                    return (
                      <div
                        key={key}
                        className={cn(
                          'flex flex-col sm:flex-row sm:justify-between gap-4 p-3 sm:p-4 border rounded-lg transition-opacity',
                          isItemUpdating && 'opacity-50',
                        )}
                      >
                        {/* Mobile layout: Image and basic info on top */}
                        <div className="flex gap-3 sm:gap-4">
                          {/* Product Image */}
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                            {pricing.discount > 0 && (
                              <Badge
                                variant="destructive"
                                className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 text-xs px-1 py-0"
                              >
                                -{pricing.discount}%
                              </Badge>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="block"
                            >
                              <h3 className="font-medium text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-2">
                                {item.product.name}
                              </h3>
                            </Link>

                            {variantText && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
                                {variantText}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-1 sm:mt-2">
                              <span className="font-semibold text-sm sm:text-base text-foreground">
                                {formatCurrency(finalPrice, shop!.currency)}
                              </span>
                              {pricing.discount > 0 && (
                                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                                  {formatCurrency(pricing.price, shop!.currency)}
                                </span>
                              )}
                            </div>

                            {/* Stock Status - Mobile */}
                            {item.product.stock_quantity < 5 && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Only {item.product.stock_quantity} left
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Mobile layout: Quantity and total on bottom row */}
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_id,
                                  Math.max(1, currentQuantity - 1),
                                  item.variant_index,
                                )
                              }
                              disabled={currentQuantity <= 1 || isItemUpdating}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>

                            <Input
                              type="number"
                              min="1"
                              max={item.product.stock_quantity}
                              value={currentQuantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 1;
                                const maxQty = Math.min(
                                  newQty,
                                  item.product.stock_quantity,
                                );
                                setQuantities((prev) => ({
                                  ...prev,
                                  [key]: maxQty,
                                }));
                              }}
                              onBlur={() => {
                                const newQty = Math.min(
                                  Math.max(1, currentQuantity),
                                  item.product.stock_quantity,
                                );
                                if (newQty !== item.quantity) {
                                  handleQuantityChange(
                                    item.product_id,
                                    newQty,
                                    item.variant_index,
                                  );
                                }
                              }}
                              className="w-12 sm:w-16 h-8 text-center text-sm"
                              disabled={isItemUpdating}
                            />

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleQuantityChange(
                                  item.product_id,
                                  Math.min(
                                    currentQuantity + 1,
                                    totalStock,
                                  ),
                                  item.variant_index,
                                )
                              }
                              disabled={
                                currentQuantity >= totalStock || isItemUpdating
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Price and Remove */}
                          <div className="text-right">
                            <p className="font-semibold text-sm sm:text-base">
                              {formatCurrency(finalPrice * currentQuantity, shop!.currency)}
                            </p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleRemoveItem(
                                  item.product_id,
                                  item.variant_index,
                                )
                              }
                              disabled={isItemUpdating}
                              className="text-error hover:text-error/80 hover:bg-error/10 mt-1 h-8 px-2"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">Remove</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-4 lg:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{formatCurrency(cartTotal, shop!.currency)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-success">Free</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold text-base sm:text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(cartTotal, shop!.currency)}</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={() => router.push('/checkout')}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>

                  <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    Secure checkout powered by SSL encryption
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="hidden sm:block">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-5 h-5 text-success shrink-0" />
                    <div>
                      <p className="font-medium">Free Shipping</p>
                      <p className="text-muted-foreground">On orders over $50</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Package className="w-5 h-5 text-info shrink-0" />
                    <div>
                      <p className="font-medium">Easy Returns</p>
                      <p className="text-muted-foreground">30-day return policy</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Heart className="w-5 h-5 text-error shrink-0" />
                    <div>
                      <p className="font-medium">Customer Support</p>
                      <p className="text-muted-foreground">24/7 help available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Continue Shopping */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/products`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
