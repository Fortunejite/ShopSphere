'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Eye,
  Plus,
  BarChart3,
  Clock,
  AlertCircle,
  Settings,
  Layers3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  StatsCardSkeleton,
  AlertCardSkeleton,
  RecentOrdersSkeleton,
  TopProductsSkeleton,
  QuickActionsSkeleton,
  RevenueChartSkeleton,
  OrderStatusChartSkeleton,
} from '@/components/AdminDashboardSkeleton';
import { useAppSelector } from '@/hooks/redux.hook';
import { cn } from '@/lib/utils';
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';

/* ─────────────────────────── Types ─────────────────────────── */

interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  monthlyOrders: number;
  totalProducts: number;
  activeProducts: number;
  totalCustomers: number;
  monthlyCustomers: number;
  confirmedOrders: number;
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

interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface OrderStatusItem {
  status: string;
  count: number;
}

/* ─────────────────────── Chart colours ─────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  pending:    '#f59e0b',
  processing: '#3b82f6',
  shipped:    '#8b5cf6',
  delivered:  '#10b981',
  cancelled:  '#ef4444',
};

/* ─────────────────── Custom tooltips ───────────────────── */

function RevenueTooltip({ active, payload, label, currency }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const date = label
    ? new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-2 shadow-xl text-sm">
      <p className="text-muted-foreground mb-1">{date}</p>
      <p className="font-semibold text-foreground">{formatCurrency(payload[0].value, currency)}</p>
    </div>
  );
}

function PieTooltip({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-2 shadow-xl text-sm">
      <p className="capitalize font-medium text-foreground">{payload[0].name}</p>
      <p className="text-muted-foreground">{payload[0].value} orders</p>
    </div>
  );
}

/* ═══════════════════════ Main Component ═══════════════════════ */

export default function AdminDashboardPage() {
  const { domain } = useParams();
  const { shop } = useAppSelector((state) => state.shop);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenueDataPoint[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusItem[]>([]);
  const [chartDays, setChartDays] = useState<7 | 30 | 90>(30);

  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [isStatusLoading, setIsStatusLoading] = useState(true);

  const [statsError, setStatsError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [productsError, setProductsError] = useState('');
  const [chartError, setChartError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true); setStatsError('');
      const res = await axios.get(`/api/shops/${domain}/admin/dashboard/stats`);
      setStats(res.data);
    } catch { setStatsError('Failed to load statistics'); }
    finally { setIsStatsLoading(false); }
  }, [domain]);

  const fetchRecentOrders = useCallback(async () => {
    try {
      setIsOrdersLoading(true); setOrdersError('');
      const res = await axios.get(`/api/shops/${domain}/admin/dashboard/recent-orders`);
      setRecentOrders(res.data);
    } catch { setOrdersError('Failed to load recent orders'); }
    finally { setIsOrdersLoading(false); }
  }, [domain]);

  const fetchTopProducts = useCallback(async () => {
    try {
      setIsProductsLoading(true); setProductsError('');
      const res = await axios.get(`/api/shops/${domain}/admin/dashboard/top-products`);
      setTopProducts(res.data);
    } catch { setProductsError('Failed to load top products'); }
    finally { setIsProductsLoading(false); }
  }, [domain]);

  const fetchRevenueChart = useCallback(async (days: number) => {
    try {
      setIsChartLoading(true); setChartError('');
      const res = await axios.get(`/api/shops/${domain}/admin/dashboard/revenue-chart?days=${days}`);
      setRevenueChart(res.data);
    } catch { setChartError('Failed to load chart data'); }
    finally { setIsChartLoading(false); }
  }, [domain]);

  const fetchOrderStatus = useCallback(async () => {
    try {
      setIsStatusLoading(true);
      const res = await axios.get(`/api/shops/${domain}/admin/dashboard/order-status`);
      setOrderStatus(res.data);
    } catch { /* silent */ }
    finally { setIsStatusLoading(false); }
  }, [domain]);

  const refreshAll = useCallback(() => {
    fetchStats(); fetchRecentOrders(); fetchTopProducts();
    fetchRevenueChart(chartDays); fetchOrderStatus();
  }, [fetchStats, fetchRecentOrders, fetchTopProducts, fetchRevenueChart, fetchOrderStatus, chartDays]);

  useEffect(() => { refreshAll(); }, [domain]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChartDaysChange = (days: 7 | 30 | 90) => {
    setChartDays(days); fetchRevenueChart(days);
  };

  const getStatusColor = (status: string) => ({
    pending:    'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    confirmed:  'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    processing: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    shipped:    'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    delivered:  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    cancelled:  'bg-red-500/10 text-red-600 dark:text-red-400',
    refunded:   'bg-muted text-muted-foreground',
  }[status] ?? 'bg-muted text-muted-foreground');

  const formatPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

  const formatAxisDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const formatAxisCurrency = (val: number) => {
    const sym = getCurrencySymbol(shop?.currency ?? 'USD');
    if (val >= 1_000_000) return `${sym}${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000)     return `${sym}${(val / 1_000).toFixed(0)}k`;
    return `${sym}${val}`;
  };

  const totalStatusOrders = orderStatus.reduce((s, i) => s + i.count, 0);

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back! Here&apos;s what&apos;s happening with{' '}
                <span className="font-medium text-foreground">{shop?.name ?? 'your shop'}</span>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/products/new`}>
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={refreshAll}>
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/settings`}>
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isStatsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
          ) : statsError ? (
            <div className="col-span-full">
              <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{statsError}</AlertDescription></Alert>
            </div>
          ) : (
            <>
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(stats?.totalRevenue ?? 0, shop!.currency)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {(stats?.revenueGrowth ?? 0) >= 0
                          ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                          : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                        <span className={cn('text-xs font-semibold', (stats?.revenueGrowth ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                          {formatPct(stats?.revenueGrowth ?? 0)}
                        </span>
                        <span className="text-xs text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>This month</span>
                    <span className="font-medium text-foreground">{formatCurrency(stats?.monthlyRevenue ?? 0, shop!.currency)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stats?.totalOrders ?? 0}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {(stats?.orderGrowth ?? 0) >= 0
                          ? <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
                          : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
                        <span className={cn('text-xs font-semibold', (stats?.orderGrowth ?? 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400')}>
                          {formatPct(stats?.orderGrowth ?? 0)}
                        </span>
                        <span className="text-xs text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>This month</span>
                    <span className="font-medium text-foreground">{stats?.monthlyOrders ?? 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Products</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stats?.totalProducts ?? 0}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="font-medium text-violet-600 dark:text-violet-400">{stats?.activeProducts ?? 0}</span> active
                        {(stats?.lowStockProducts ?? 0) > 0 && (
                          <span className="ml-2 text-amber-500">· {stats!.lowStockProducts} low stock</span>
                        )}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Inactive</span>
                    <span className="font-medium text-foreground">{(stats?.totalProducts ?? 0) - (stats?.activeProducts ?? 0)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Customers</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stats?.totalCustomers ?? 0}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="font-medium text-orange-600 dark:text-orange-400">{stats?.monthlyCustomers ?? 0}</span> new this month
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Returning</span>
                    <span className="font-medium text-foreground">{Math.max(0, (stats?.totalCustomers ?? 0) - (stats?.monthlyCustomers ?? 0))}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Alerts + Quick Actions */}
        {isStatsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <AlertCardSkeleton /><AlertCardSkeleton /><QuickActionsSkeleton />
          </div>
        ) : !statsError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(stats?.confirmedOrders ?? 0) > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5 hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-foreground">{stats!.confirmedOrders} Processing Orders</p>
                      <p className="text-xs text-muted-foreground">Waiting to be fulfilled</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild className="flex-shrink-0">
                    <Link href={`/admin/orders?status=processing`}>View</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            {(stats?.lowStockProducts ?? 0) > 0 && (
              <Card className="border-red-500/30 bg-red-500/5 hover:shadow-md transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-foreground">{stats!.lowStockProducts} Low Stock Items</p>
                      <p className="text-xs text-muted-foreground">Running low on inventory</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild className="flex-shrink-0">
                    <Link href={`/admin/products?filter=low_stock`}>View</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            <Card className="hover:shadow-md transition-all">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link href={`/admin/products/new`}><Plus className="w-3 h-3 mr-1" /> Product</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link href={`/admin/orders`}><Package className="w-3 h-3 mr-1" /> Orders</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link href={`/admin/analytics`}><BarChart3 className="w-3 h-3 mr-1" /> Analytics</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue Area Chart */}
        {isChartLoading ? (
          <RevenueChartSkeleton />
        ) : chartError ? (
          <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{chartError}</AlertDescription></Alert>
        ) : (
          <Card className="hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Daily Revenue</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {chartDays === 7 ? 'Last 7 days' : chartDays === 30 ? 'Last 30 days' : 'Last 90 days'}
                  </p>
                </div>
                <div className="flex items-center rounded-lg border border-border p-0.5 w-fit">
                  {([7, 30, 90] as const).map((d) => (
                    <button key={d} onClick={() => handleChartDaysChange(d)}
                      className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
                        chartDays === d ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pr-2">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueChart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatAxisDate}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false}
                    interval={chartDays === 7 ? 0 : chartDays === 30 ? 4 : 8} />
                  <YAxis tickFormatter={formatAxisCurrency}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<RevenueTooltip currency={shop?.currency ?? 'USD'} />}
                    cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5}
                    fill="url(#revenueGrad)" dot={false}
                    activeDot={{ r: 4, fill: '#10b981', stroke: 'var(--background)', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Donut + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isStatusLoading ? (
            <OrderStatusChartSkeleton />
          ) : (
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Order Breakdown</CardTitle>
                <p className="text-xs text-muted-foreground">{totalStatusOrders} total orders</p>
              </CardHeader>
              <CardContent>
                {totalStatusOrders === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                    <ShoppingCart className="w-10 h-10 opacity-30" />
                    <p className="text-sm">No order data yet</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={orderStatus.filter(s => s.count > 0)} cx="50%" cy="50%"
                          innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="count" nameKey="status">
                          {orderStatus.filter(s => s.count > 0).map((entry) => (
                            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#94a3b8'} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-1.5">
                      {orderStatus.filter(s => s.count > 0).map((s) => (
                        <div key={s.status} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: STATUS_COLORS[s.status] ?? '#94a3b8' }} />
                            <span className="capitalize text-muted-foreground">{s.status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{s.count}</span>
                            <span className="text-muted-foreground w-8 text-right">
                              {totalStatusOrders > 0 ? `${Math.round((s.count / totalStatusOrders) * 100)}%` : '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {isOrdersLoading ? (
            <div className="lg:col-span-2"><RecentOrdersSkeleton /></div>
          ) : ordersError ? (
            <div className="lg:col-span-2">
              <Card>
                <CardHeader><CardTitle className="text-base font-semibold">Recent Orders</CardTitle></CardHeader>
                <CardContent>
                  <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{ordersError}</AlertDescription></Alert>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="lg:col-span-2 hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Last {recentOrders.length} transactions</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/orders`}><Eye className="w-3.5 h-3.5 mr-1.5" />View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <ShoppingCart className="w-10 h-10 opacity-30" />
                    <p className="text-sm">No recent orders</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {recentOrders.slice(0, 6).map((order) => {
                      const initials = order.customer_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                      return (
                        <div key={order.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors group">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">
                              #{order.tracking_id} · {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground hidden sm:block flex-shrink-0">
                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-sm font-semibold text-foreground flex-shrink-0">
                            {formatCurrency(order.total_amount, shop!.currency)}
                          </span>
                          <Badge className={cn('text-xs capitalize flex-shrink-0', getStatusColor(order.status))}>
                            {order.status}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto flex-shrink-0">
                            <Link href={`/admin/orders/${order.tracking_id}`}>
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Products: Bar Chart + Revenue List */}
        {isProductsLoading ? (
          <TopProductsSkeleton />
        ) : productsError ? (
          <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{productsError}</AlertDescription></Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Top Products by Sales</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Units sold</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/products`}><Package className="w-3.5 h-3.5 mr-1.5" />All Products</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pr-2">
                {topProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                    <Package className="w-10 h-10 opacity-30" /><p className="text-sm">No sales data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={90}
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false}
                        tickFormatter={(v: string) => v.length > 12 ? `${v.slice(0, 12)}...` : v} />
                      <Tooltip formatter={(val: number) => [val, 'Units sold']}
                        contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '0.75rem', fontSize: '12px' }}
                        cursor={{ fill: 'var(--muted)', opacity: 0.4 }} />
                      <Bar dataKey="sales_count" radius={[0, 6, 6, 0]} maxBarSize={28}>
                        {topProducts.map((_, i) => {
                          const hues = ['#10b981','#3b82f6','#8b5cf6','#f59e0b','#ef4444'];
                          return <Cell key={i} fill={hues[i % hues.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Top Products by Revenue</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Estimated from price x sales</p>
              </CardHeader>
              <CardContent className="p-0">
                {topProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <Package className="w-10 h-10 opacity-30" /><p className="text-sm">No product sales data</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {topProducts.map((product, index) => {
                      const maxRevenue = topProducts[0]?.revenue || 1;
                      const pct = (product.revenue / maxRevenue) * 100;
                      const rankColors = ['text-amber-500','text-slate-400','text-amber-700'];
                      return (
                        <div key={product.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                          <span className={cn('text-sm font-bold w-5 text-center flex-shrink-0', rankColors[index] ?? 'text-muted-foreground')}>
                            {index + 1}
                          </span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.image} alt={product.name} className="w-9 h-9 rounded-lg object-cover bg-muted flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
                                style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-foreground">{formatCurrency(product.revenue, shop!.currency)}</p>
                            <p className="text-xs text-muted-foreground">{product.sales_count} sold</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Tools Nav */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Admin Tools</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { href: `/admin/orders`,     icon: ShoppingCart, label: 'Orders',     color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-500/10'     },
              { href: `/admin/products`,   icon: Package,      label: 'Products',   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10' },
              { href: `/admin/categories`, icon: Layers3,      label: 'Categories', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
              { href: `/admin/customers`,  icon: Users,        label: 'Customers',  color: 'text-orange-600 dark:text-orange-400',  bg: 'bg-orange-500/10'  },
              { href: `/admin/analytics`,  icon: BarChart3,    label: 'Analytics',  color: 'text-pink-600 dark:text-pink-400',      bg: 'bg-pink-500/10'    },
              { href: `/admin/settings`,   icon: Settings,     label: 'Settings',   color: 'text-slate-600 dark:text-slate-400',    bg: 'bg-slate-500/10'   },
            ].map(({ href, icon: Icon, label, color, bg }) => (
              <Link key={label} href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border border-border p-4 h-20',
                  'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200'
                )}>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', bg)}>
                  <Icon className={cn('w-4 h-4', color)} />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
