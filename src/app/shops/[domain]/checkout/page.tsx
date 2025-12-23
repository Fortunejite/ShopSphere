'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { 
  ShoppingCart,
  CreditCard,
  Truck,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { CartItemWithProduct } from '@/models/Cart';
import { ProductLoading } from '@/components/Loading';
import { createOrderSchema } from '@/lib/schema/order';

import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';
import { useAppSelector } from '@/hooks/redux.hook';

const checkoutSchema = createOrderSchema.extend({
  use_billing_as_shipping: z.boolean().optional().default(false),
}).refine(data => data, {
  message: "Form validation failed"
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { domain } = useParams();
  const router = useRouter();
  const shop = useAppSelector(state => state.shop.shop);

  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping_address: {
        name: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
      },
      payment_method: 'credit_card',
      notes: '',
      discount_amount: 0,
      use_billing_as_shipping: false,
    }
  });

  useEffect(() => {
    fetchCartItems();
  }, [domain]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await axios.get(`/api/shops/${domain}/cart`);
      const items = response.data.items || [];
      
      if (items.length === 0) {
        router.push('/cart');
        return;
      }
      
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const itemPrice = item.variant_index !== undefined && item.product.variants[item.variant_index] 
        ? item.product.variants[item.variant_index].price * (1 - item.product.variants[item.variant_index].discount / 100)
        : item.product.price * (1 - item.product.discount / 100);
      return total + (itemPrice * item.quantity);
    }, 0);

    const discountAmount = form.watch('discount_amount') || 0;
    const total = subtotal - discountAmount;

    return {
      subtotal: subtotal,
      discount: discountAmount,
      total: total
    };
  };

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setIsSubmitting(true);
      setError('');
      const response = await axios.post(`/api/shops/${domain}/orders`, data);
      
      // Redirect to order confirmation page
      router.push(response.data.checkoutUrl);
    } catch (error) {
      console.error('Error creating order:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || 'Failed to create order');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <ProductLoading text="Loading checkout..." fullPage />;
  }

  if (error && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Button>
              <h1 className="text-2xl font-bold">Checkout</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShoppingCart className="w-4 h-4" />
              <span>{cartItems.length} items</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping_name">Full Name *</Label>
                    <Input
                      id="shipping_name"
                      {...form.register('shipping_address.name')}
                      placeholder="John Doe"
                    />
                    {form.formState.errors.shipping_address?.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.shipping_address.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="shipping_phone">Phone Number *</Label>
                    <Input
                      id="shipping_phone"
                      {...form.register('shipping_address.phone')}
                      placeholder="(555) 123-4567"
                    />
                    {form.formState.errors.shipping_address?.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.shipping_address.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="shipping_address_1">Address Line 1 *</Label>
                  <Input
                    id="shipping_address_1"
                    {...form.register('shipping_address.address_line_1')}
                    placeholder="123 Main Street"
                  />
                  {form.formState.errors.shipping_address?.address_line_1 && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.shipping_address.address_line_1.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shipping_address_2">Address Line 2</Label>
                  <Input
                    id="shipping_address_2"
                    {...form.register('shipping_address.address_line_2')}
                    placeholder="Apt, Suite, Unit, Building, Floor, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shipping_city">City *</Label>
                    <Input
                      id="shipping_city"
                      {...form.register('shipping_address.city')}
                      placeholder="New York"
                    />
                    {form.formState.errors.shipping_address?.city && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.shipping_address.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="shipping_state">State *</Label>
                    <Input
                      id="shipping_state"
                      {...form.register('shipping_address.state')}
                      placeholder="NY"
                    />
                    {form.formState.errors.shipping_address?.state && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.shipping_address.state.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="shipping_postal_code">ZIP Code *</Label>
                    <Input
                      id="shipping_postal_code"
                      {...form.register('shipping_address.postal_code')}
                      placeholder="10001"
                    />
                    {form.formState.errors.shipping_address?.postal_code && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.shipping_address.postal_code.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="credit_card"
                      {...form.register('payment_method')}
                      value="credit_card"
                      className="w-4 h-4"
                    />
                    <Label htmlFor="credit_card">Credit Card</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...form.register('notes')}
                  placeholder="Any special instructions or notes for your order..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const variant = item.variant_index !== undefined ? item.product.variants[item.variant_index] : null;
                    const price = variant ? variant.price : item.product.price;
                    const discount = variant ? variant.discount : item.product.discount;
                    const finalPrice = price * (1 - discount / 100);

                    return (
                      <div key={`${item.product_id}-${item.variant_index || 0}`} className="flex gap-3">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product.name}</h4>
                          {variant && (
                            <div className="text-xs text-gray-600 mt-1">
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                            <span className="font-medium">{formatCurrency(finalPrice * item.quantity, shop!.currency)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal, shop!.currency)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>{formatCurrency(-totals.discount, shop!.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total, shop!.currency)}</span>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting || cartItems.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <div className="text-xs text-gray-500 text-center mt-4">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Truck className="w-3 h-3" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <p>
                    By placing this order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
