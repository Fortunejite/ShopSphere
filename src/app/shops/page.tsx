'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search,
  Trash2, 
  Store, 
  Globe, 
  DollarSign,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Settings
} from 'lucide-react';
import axios from 'axios';
import { useAppSelector } from '@/hooks/redux.hook';
import { ShopWithOwner } from '@/models/Shop';
import { generateURL } from '@/lib/domain';

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopWithOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<ShopWithOwner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const categoriesState = useAppSelector(state => state.category.categories);
  const categories = categoriesState.filter(cat => cat.parent_id === null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/shops');
        setShops(response.data);
      } catch (error) {
        console.error('Error fetching shops:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to fetch shops. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchShops();
  }, [router]);

  const handleDeleteShop = async () => {
    if (!selectedShop) return;

    setIsSubmitting(true);
    setError('');

    try {
      // API call to delete shop
      await axios.delete(`/api/shops/${selectedShop.domain}`);
      
      // Update local state
      setShops(prev => prev.filter(shop => shop.id !== selectedShop.id));
      
      setSuccess('Shop deleted successfully!');
      setIsDeleteOpen(false);
      setSelectedShop(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting shop:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to delete shop. Please try again.');
      } else {
        setError('Failed to delete shop. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (shop: ShopWithOwner) => {
    setSelectedShop(shop);
    setError('');
    setIsDeleteOpen(true);
  };

  // Filter shops based on search term and category
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || shop.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
              <Store className="w-8 h-8 text-neutral-700" />
              My Shops
            </h1>
            <p className="text-neutral-600 mt-1">Manage your online stores</p>
          </div>
          
          <Button asChild className="flex items-center gap-2">
            <Link href="/shops/new">
              <Plus className="w-4 h-4" />
              Create Shop
            </Link>
          </Button>
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                placeholder="Search shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="w-full sm:w-48">
            <Select value={selectedCategory.toString()} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-500" />
              <p className="text-neutral-500">Loading your shops...</p>
            </div>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                <Store className="w-8 h-8 text-neutral-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-900">
                  {shops.length === 0 ? 'No shops yet' : 'No shops found'}
                </h3>
                <p className="text-neutral-500 mt-1">
                  {shops.length === 0 
                    ? 'Create your first shop to get started'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
              {shops.length === 0 && (
                <Button asChild className="mt-4">
                  <Link href="/shops/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Shop
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <Card key={shop.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl group-hover:text-neutral-800 transition-colors">
                        {shop.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {shop.domain}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {shop.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {shop.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {shop.currency}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Created {shop.created_at ? new Date(shop.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 flex items-center justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={generateURL(shop.domain)} target="_blank" className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Visit
                    </Link>
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`${generateURL(shop.domain)}/admin/settings`} target="_blank" className="flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        Settings
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteModal(shop)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Shop</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &ldquo;{selectedShop?.name}&rdquo;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteShop}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Shop'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
