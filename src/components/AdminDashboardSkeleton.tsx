'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-24 mb-3 animate-pulse"></div>
            <div className="h-8 bg-muted rounded w-32 mb-3 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-28 animate-pulse"></div>
          </div>
          <div className="w-12 h-12 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AlertCardSkeleton() {
  return (
    <Card className="border-border bg-secondary">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center flex-1">
            <div className="w-5 h-5 bg-muted rounded mr-3 animate-pulse"></div>
            <div>
              <div className="h-4 bg-muted rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-48 animate-pulse"></div>
            </div>
          </div>
          <div className="w-16 h-8 bg-muted rounded animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentOrdersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <div className="w-20 h-8 bg-muted rounded animate-pulse"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  <div className="w-16 h-5 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="h-3 bg-muted rounded w-24 mb-1 animate-pulse"></div>
                <div className="flex items-center justify-between mt-1">
                  <div className="h-3 bg-muted rounded w-12 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                </div>
              </div>
              <div className="w-8 h-8 bg-muted rounded ml-2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TopProductsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Selling Products</CardTitle>
          <div className="w-28 h-8 bg-muted rounded animate-pulse"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded animate-pulse"></div>
                <div>
                  <div className="h-4 bg-muted rounded w-32 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center mb-1 justify-end">
                  <div className="w-3 h-3 bg-muted rounded mr-1 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-6 animate-pulse"></div>
                </div>
                <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickActionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-full h-10 bg-muted rounded animate-pulse"></div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AdminToolsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
