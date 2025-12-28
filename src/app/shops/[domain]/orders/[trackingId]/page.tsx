'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  Copy,
  Download,
  MessageCircle,
  Phone,
  Loader2
} from 'lucide-react';
import { ProductLoading } from '@/components/Loading';
import { OrderWithProducts } from '@/models/Order';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { useAppSelector } from '@/hooks/redux.hook';

export default function OrderDetailsPage() {
  const { domain, trackingId } = useParams();
  const router = useRouter();
  const shop = useAppSelector(state => state.shop.shop);
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  
  const [order, setOrder] = useState<OrderWithProducts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [domain, trackingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await axios.get(`/api/shops/${domain}/orders/${trackingId}`);
      console.log(response.data)
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setError('Order not found');
        } else {
          setError('Failed to load order details');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: X,
      refunded: CreditCard
    };
    const IconComponent = icons[status as keyof typeof icons] || Clock;
    return <IconComponent className="w-4 h-4" />;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const copyTrackingId = () => {
    if (order) {
      navigator.clipboard.writeText(order.tracking_id);
      // You could add a toast notification here
    }
  };

  const getOrderTimeline = () => {
    if (!order) return [];
    
    const timeline = [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been received',
        date: order.created_at,
        completed: true
      },
      {
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Your order has been confirmed',
        date: order.created_at, // This would be updated based on actual status changes
        completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
      },
      {
        status: 'processing',
        title: 'Processing',
        description: 'Your order is being prepared',
        date: order.created_at,
        completed: ['processing', 'shipped', 'delivered'].includes(order.status)
      },
      {
        status: 'shipped',
        title: 'Shipped',
        description: 'Your order is on the way',
        date: order.shipped_at,
        completed: ['shipped', 'delivered'].includes(order.status)
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Your order has been delivered',
        date: order.delivered_at,
        completed: order.status === 'delivered'
      }
    ];

    return timeline.filter(() => 
      order.status !== 'cancelled' && order.status !== 'refunded'
    );
  };

  const handelPayNow = async () => {
    setPaying(true);
    try {
      const { data } = await axios.get(`/api/shops/${domain}/orders/${trackingId}/pay`);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError('Failed to initiate payment.');
        setPaying(false);
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('Failed to initiate payment.');
      setPaying(false);
    }
  }

  if (isLoading) {
    return <ProductLoading text="Loading order details..." fullPage />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Order not found'}</AlertDescription>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Alert */}
      {isSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <strong>Order placed successfully!</strong> Your order #{order.tracking_id} has been received and is being processed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-4 sm:gap-y-0">
            <div className="flex flex-col xs:flex-row xs:items-center xs:gap-4 space-y-2 xs:space-y-0">
              <Button
                variant="ghost"
                onClick={() => router.push('/orders')}
                size="sm"
                className="w-fit"
              >
                <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="xs:inline">Back to Orders</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Order #{order.tracking_id}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3 w-full xs:w-auto">
              <Badge className={cn('flex items-center justify-center gap-1 py-1 px-2', getStatusColor(order.status))}>
                {getStatusIcon(order.status)}
                <span className="text-xs font-medium">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={copyTrackingId}
                className="flex items-center justify-center gap-2 w-full xs:w-auto"
              >
                <Copy className="w-4 h-4 flex-shrink-0" />
                <span>Copy ID</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            {order.status !== 'cancelled' && order.status !== 'refunded' && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getOrderTimeline().map((item) => (
                      <div key={item.status} className="flex items-start gap-4">
                        <div className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full border-2',
                          item.completed
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : 'bg-gray-100 border-gray-300 text-gray-500'
                        )}>
                          {item.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              'font-medium',
                              item.completed ? 'text-gray-900' : 'text-gray-500'
                            )}>
                              {item.title}
                            </h4>
                            {item.date && (
                              <span className="text-sm text-gray-500">
                                {new Date(item.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            'text-sm mt-1',
                            item.completed ? 'text-gray-600' : 'text-gray-400'
                          )}>
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.total_items})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg">
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-lg">{item.product.name}</h4>
                        {item.variant_index !== undefined && item.product.variants[item.variant_index] && (
                          <div className="text-sm text-gray-600 mt-1">
                            {Object.entries(item.product.variants[item.variant_index].attributes).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(item.subtotal, shop!.currency)}
                            </div>
                            {item.discount_at_purchase > 0 && (
                              <div className="text-sm text-gray-500 line-through">
                                {formatCurrency(item.unit_price_at_purchase * item.quantity, shop!.currency)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="border-t pt-4 mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.total_amount, shop!.currency)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>{formatCurrency(-order.discount_amount, shop!.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(order.final_amount, shop!.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getPaymentStatusColor(order.payment_status)}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </Badge>
                </div>
                {order.payment_method && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Method:</span>
                    <span className="text-sm capitalize">{order.payment_method.replace('_', ' ')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Paid:</span>
                  <span className="font-medium">{formatCurrency(order.final_amount, shop!.currency)}</span>
                </div>
                {order.payment_status === 'pending' && (
                  <Button className="w-full" onClick={handelPayNow} disabled={paying}>
                    {paying ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <span className="mr-2">Pay Now to Confirm Order</span>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{order.shipping_address.name}</p>
                    <p>{order.shipping_address.address_line_1}</p>
                    {order.shipping_address.address_line_2 && (
                      <p>{order.shipping_address.address_line_2}</p>
                    )}
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                    </p>
                    <p>{order.shipping_address.country}</p>
                    <p className="text-gray-600 mt-2">
                      Phone: {order.shipping_address.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions TODO: Implement actions*/}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                
                {(order.status === 'pending') && (
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                    <X className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}

                <Button variant="outline" className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="mb-3">
                    If you have any questions about your order, feel free to contact us.
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    <span>{shop!.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>{shop!.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
