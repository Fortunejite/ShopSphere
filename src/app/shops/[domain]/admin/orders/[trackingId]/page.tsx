'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  Copy,
  Edit,
  Save,
  User,
  Phone,
  DollarSign
} from 'lucide-react';
import { ProductLoading } from '@/components/Loading';
import { OrderWithProducts } from '@/models/Order';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { useAppSelector } from '@/hooks/redux.hook';

export default function AdminOrderDetailsPage() {
  const { domain, trackingId } = useParams();
  const router = useRouter();
  const shop = useAppSelector((s) => s.shop.shop);
  
  const [order, setOrder] = useState<OrderWithProducts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [domain, trackingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await axios.get(`/api/shops/${domain}/admin/orders/${trackingId}`);
      const resData = response.data;
      const orderData = resData.order
      setOrder(orderData);
      setNewStatus(orderData.status);
      setNewPaymentStatus(orderData.payment_status);
      setAdminNotes(orderData.admin_notes || '');
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

  const updateOrderStatus = async () => {
    try {
      setIsUpdating(true);
      await axios.patch(`/api/shops/${domain}/admin/orders/${order!.tracking_id}`, {
        status: newStatus,
        admin_notes: adminNotes
      });
      
      // Refresh order data
      await fetchOrderDetails();
      setIsEditingStatus(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePaymentStatus = async () => {
    try {
      setIsUpdating(true);
      await axios.patch(`/api/shops/${domain}/admin/orders/${order!.tracking_id}/payment`, {
        payment_status: newPaymentStatus
      });
      
      // Refresh order data
      await fetchOrderDetails();
      setIsEditingPayment(false);
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    } finally {
      setIsUpdating(false);
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
      refunded: DollarSign
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
    }
  };

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
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin/orders')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order.tracking_id}
                </h1>
                <p className="text-gray-600 mt-1">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={cn('flex items-center gap-1', getStatusColor(order.status))}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              <Badge className={getPaymentStatusColor(order.payment_status)}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={copyTrackingId}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy ID
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Order Status Management
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingStatus(!isEditingStatus)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditingStatus ? 'Cancel' : 'Edit Status'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingStatus ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Notes
                      </label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this order update..."
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={updateOrderStatus}
                      disabled={isUpdating}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isUpdating ? 'Updating...' : 'Update Status'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Current Status:</span>
                      <Badge className={cn('flex items-center gap-1', getStatusColor(order.status))}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    {order.admin_notes && (
                      <div>
                        <span className="font-medium text-sm text-gray-700">Admin Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{order.admin_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

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
                        <p className="text-sm text-gray-600 mt-1">Product ID: {item.product_id}</p>
                        {item.variant_index !== undefined && item.product.variants[item.variant_index] && (
                          <div className="text-sm text-gray-600 mt-1">
                            {Object.entries(item.product.variants[item.variant_index].attributes).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-sm">
                            <span className="text-gray-600">Quantity: </span>
                            <span className="font-medium">{item.quantity}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-lg">
                              {formatCurrency(item.subtotal, shop!.currency)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatCurrency(item.unit_price_at_purchase, shop!.currency)} each
                            </div>
                            {item.discount_at_purchase > 0 && (
                              <div className="text-xs text-green-600">
                                {item.discount_at_purchase}% off
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
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>{formatCurrency(order.shipping_amount, shop!.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatCurrency(order.tax_amount, shop!.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(order.final_amount, shop!.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Customer ID:</span>
                  <span className="text-sm font-medium">{order.user_id}</span>
                </div>
                {order.shipping_address && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{order.shipping_address.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm font-medium">{order.shipping_address.phone}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingPayment(!isEditingPayment)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditingPayment ? 'Cancel' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditingPayment ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Status
                      </label>
                      <select
                        value={newPaymentStatus}
                        onChange={(e) => setNewPaymentStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                    <Button
                      onClick={updatePaymentStatus}
                      disabled={isUpdating}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isUpdating ? 'Updating...' : 'Update Payment'}
                    </Button>
                  </div>
                ) : (
                  <>
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
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="font-medium">{formatCurrency(order.final_amount, shop!.currency)}</span>
                    </div>
                  </>
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
                    <div className="flex items-center gap-1 mt-2 text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{order.shipping_address.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Address */}
            {order.billing_address && order.billing_address !== order.shipping_address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{order.billing_address.name}</p>
                    <p>{order.billing_address.address_line_1}</p>
                    {order.billing_address.address_line_2 && (
                      <p>{order.billing_address.address_line_2}</p>
                    )}
                    <p>
                      {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                    </p>
                    <p>{order.billing_address.country}</p>
                    <div className="flex items-center gap-1 mt-2 text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{order.billing_address.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Order Created</p>
                      <p className="text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {order.shipped_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="font-medium">Order Shipped</p>
                        <p className="text-gray-600">{new Date(order.shipped_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {order.delivered_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="font-medium">Order Delivered</p>
                        <p className="text-gray-600">{new Date(order.delivered_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {order.cancelled_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <X className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="font-medium">Order Cancelled</p>
                        <p className="text-gray-600">{new Date(order.cancelled_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-gray-600">{new Date(order.updated_at).toLocaleString()}</p>
                    </div>
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
