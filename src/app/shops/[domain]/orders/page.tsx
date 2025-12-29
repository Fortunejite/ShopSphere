'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package,
  Search,
  Calendar,
  Eye,
  Filter,
  Truck,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import { ProductLoading } from '@/components/Loading';
import { OrderWithProducts } from '@/models/Order';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { useAppSelector } from '@/hooks/redux.hook';
import { useSession } from 'next-auth/react';

export default function OrdersPage() {
  const { domain } = useParams();
  const { status: authStatus } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const shop = useAppSelector(state => state.shop.shop);

  const [orders, setOrders] = useState<OrderWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [domain, currentPage, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await axios.get(`/api/shops/${domain}/orders?${params}`);
      
      setOrders(response.data.orders || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalOrders(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-warning/10 text-warning-foreground',
      confirmed: 'bg-info/10 text-info-foreground',
      processing: 'bg-secondary text-secondary-foreground',
      shipped: 'bg-primary/10 text-primary',
      delivered: 'bg-success/10 text-success-foreground',
      cancelled: 'bg-error/10 text-error-foreground',
      refunded: 'bg-muted text-muted-foreground'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
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
    return <IconComponent className="w-3 h-3" />;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-warning/10 text-warning-foreground',
      paid: 'bg-success/10 text-success-foreground',
      failed: 'bg-error/10 text-error-foreground',
      refunded: 'bg-muted text-muted-foreground'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const filteredOrders = orders.filter(order =>
    searchTerm === '' ||
    order.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => 
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading || authStatus === 'loading') {
    return <ProductLoading text="Loading your orders..." fullPage />;
  }
  
  if (authStatus === 'unauthenticated') {
    router.push(`/login?next=${pathname}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
              <p className="text-muted-foreground mt-1">
                Track and manage your orders
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {totalOrders} total orders
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by order ID or product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'No orders match your current filters.'
                  : "You haven't placed any orders yet."}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => router.push('/products')}>
                  Start Shopping
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                              Order #{order.tracking_id}
                            </h3>
                            <Badge className={cn('flex items-center gap-1', getStatusColor(order.status))}>
                              {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <Badge className={getPaymentStatusColor(order.payment_status)}>
                              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <span>{formatCurrency(order.final_amount, shop!.currency)}</span>
                            <span>{order.total_items} items</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        {order.items.slice(0, 4).map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                            <div className="relative w-12 h-12 bg-card rounded overflow-hidden">
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="flex items-center justify-center p-2 bg-muted/50 rounded-lg">
                            <span className="text-sm text-muted-foreground">
                              +{order.items.length - 4} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/orders/${order.tracking_id}`)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                      
                      {order.status === 'delivered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle reorder logic
                            console.log('Reorder:', order.id);
                          }}
                        >
                          Reorder
                        </Button>
                      )}

                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle cancel order
                            console.log('Cancel order:', order.id);
                          }}
                          className="text-error hover:text-error"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address Preview */}
                  {order.shipping_address && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="w-4 h-4" />
                        <span>Shipping to:</span>
                        <span>
                          {order.shipping_address.name}, {order.shipping_address.city}, {order.shipping_address.state}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
