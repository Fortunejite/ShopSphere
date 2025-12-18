'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  BarChart3,
  Clock,
  AlertCircle,
  Star,
  Settings,
  FileText
} from 'lucide-react';
import { ProductLoading } from '@/components/Loading';
import { useAppSelector } from '@/hooks/redux.hook';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  monthlyOrders: number;
  totalProducts: number;
  activeProducts: number;
  totalCustomers: number;
  monthlyCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
}

interface RecentOrder {
  id: number;
  tracking_id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
}

interface TopProduct {
  id: number;
  name: string;
  sales_count: number;
  revenue: number;
  image: string;
}

export default function AdminDashboardPage() {
  const { domain } = useParams();
  const { shop } = useAppSelector(state => state.shop);
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [domain]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [statsRes, ordersRes, productsRes] = await Promise.all([
        axios.get(`/api/shops/${domain}/admin/dashboard/stats`),
        axios.get(`/api/shops/${domain}/admin/dashboard/recent-orders`),
        axios.get(`/api/shops/${domain}/admin/dashboard/top-products`)
      ]);

      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
      setTopProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return <ProductLoading text="Loading admin dashboard..." fullPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back! Here&apos;s what&apos;s happening with {shop?.name || 'your shop'}.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <Link href="/admin/products/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </p>
                  <div className="flex items-center mt-2">
                    {stats && stats.revenueGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      stats && stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {stats ? formatPercentage(stats.revenueGrowth) : '0%'} from last month
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalOrders || 0}
                  </p>
                  <div className="flex items-center mt-2">
                    {stats && stats.orderGrowth >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      stats && stats.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {stats ? formatPercentage(stats.orderGrowth) : '0%'} from last month
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Products */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalProducts || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {stats?.activeProducts || 0} active
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Customers */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalCustomers || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {stats?.monthlyCustomers || 0} this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pending Orders Alert */}
          {stats && stats.pendingOrders > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        {stats.pendingOrders} Pending Orders
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Orders waiting for confirmation
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/admin/orders?status=pending">
                      View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Low Stock Alert */}
          {stats && stats.lowStockProducts > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-red-800">
                        {stats.lowStockProducts} Low Stock Items
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Products running low on inventory
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/admin/products?filter=low_stock">
                      View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/products/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Product
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/orders">
                  <Package className="w-4 h-4 mr-2" />
                  Manage Orders
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/orders">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">#{order.tracking_id}</p>
                          <Badge className={cn('text-xs', getStatusColor(order.status))}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{order.customer_name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-500">
                            {order.items_count} items
                          </span>
                          <span className="font-medium text-sm">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/orders/${order.tracking_id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Selling Products</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/products">
                    <Package className="w-4 h-4 mr-2" />
                    Manage Products
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No product sales data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {product.sales_count} sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          <Star className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">#{index + 1}</span>
                        </div>
                        <p className="text-sm font-medium">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Navigation Grid */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Admin Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                  <Link href="/admin/orders">
                    <ShoppingCart className="w-6 h-6" />
                    <span className="text-sm">Orders</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                  <Link href="/admin/products">
                    <Package className="w-6 h-6" />
                    <span className="text-sm">Products</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                  <Link href="/admin/customers">
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Customers</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                  <Link href="/admin/analytics">
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-sm">Analytics</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                  <Link href="/admin/settings">
                    <Settings className="w-6 h-6" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-20 flex-col space-y-2">
                  <Link href="/admin/reports">
                    <FileText className="w-6 h-6" />
                    <span className="text-sm">Reports</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
