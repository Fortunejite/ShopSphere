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
import { getVariaintStock } from '@/lib/product';

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
          variant_index: variantIndex,
        }),
      ).unwrap();
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const getVariantDisplayText = (item: CartItemWithProduct) => {
    if (!item.variant_index || !item.product.variants?.[item.variant_index]) {
      return null;
    }

    const variant = item.product.variants[item.variant_index];
    return Object.entries(variant.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const getItemPrice = (item: CartItemWithProduct) => {
    if (
      item.variant_index !== undefined &&
      item.product.variants?.[item.variant_index]
    ) {
      const variant = item.product.variants[item.variant_index];
      return {
        price: variant.price,
        discount: variant.discount || 0,
      };
    }
    return {
      price: item.product.price,
      discount: item.product.discount || 0,
    };
  };

  if (cartStatus === 'loading' && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Shopping Cart
                </h1>
                <p className="text-gray-600">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-semibold">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isEmpty ? (
          // Empty Cart State
          <div className="text-center py-16">
            <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven&apos;t added any items to your cart yet.
              Start shopping to fill it up!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push(`/products`)} className="px-8">
                <Package className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
              <Button variant="outline" onClick={() => router.push(``)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Store
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Cart Items ({itemCount})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.items.map((item) => {
                    const key = getItemKey(item.product_id, item.variant_index);
                    const pricing = getItemPrice(item);
                    const isItemUpdating = isUpdating === key;
                    const currentQuantity = quantities[key] || item.quantity;
                    const totalStock =
                      item.variant_index !== undefined
                        ? getVariaintStock(item.product, item.variant_index)
                        : item.product.stock_quantity;
                    const variantText = getVariantDisplayText(item);
                    const finalPrice =
                      pricing.price * (1 - pricing.discount / 100);

                    return (
                      <div
                        key={key}
                        className={cn(
                          'flex gap-4 p-4 border rounded-lg transition-opacity',
                          isItemUpdating && 'opacity-50',
                        )}
                      >
                        {/* Product Image */}
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                          {pricing.discount > 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute top-1 right-1 text-xs"
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
                            <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors truncate">
                              {item.product.name}
                            </h3>
                          </Link>

                          {variantText && (
                            <p className="text-sm text-gray-500 mt-1">
                              {variantText}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-semibold text-gray-900">
                              ${finalPrice.toFixed(2)}
                            </span>
                            {pricing.discount > 0 && (
                              <span className="text-sm text-gray-500 line-through">
                                ${pricing.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {/* Stock Status */}
                          {item.product.stock_quantity < 5 && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              Only {item.product.stock_quantity} left
                            </Badge>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
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
                              className="w-16 text-center"
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
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">
                              ${(finalPrice * currentQuantity).toFixed(2)}
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
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-1"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Remove
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
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>

                  <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    Secure checkout powered by SSL encryption
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Free Shipping</p>
                      <p className="text-gray-500">On orders over $50</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Easy Returns</p>
                      <p className="text-gray-500">30-day return policy</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Heart className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium">Customer Support</p>
                      <p className="text-gray-500">24/7 help available</p>
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
