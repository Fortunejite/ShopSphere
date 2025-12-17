'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Store, 
  Globe, 
  DollarSign,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { createShopSchema } from '@/lib/schema/shop';
import { currencySymbols } from '@/lib/currency';
import { z } from 'zod';
import axios from 'axios';
import { useAppSelector } from '@/hooks/redux.hook';
import { ShopWithOwner } from '@/models/Shop';
import { generateURL } from '@/lib/domain';
import AuthGuard from '@/components/AuthGuard';

interface ShopFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  mode: 'create' | 'update'
  submitLabel: string;
  isSubmitting: boolean;
  formData: {
    name: string;
    domain: string;
    category_id: number | undefined;
    description: string | undefined;
    currency: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    free_shipping_threshold: number | undefined;
  };
  formErrors: Record<string, string>;
  error: string;
  categories: Array<{ id: number; name: string }>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  isDomainChecking: boolean;
}

const ShopForm: React.FC<ShopFormProps> = ({
  onSubmit,
  mode,
  submitLabel,
  isSubmitting,
  formData,
  formErrors,
  error,
  categories,
  handleInputChange,
  handleSelectChange,
  isDomainChecking,
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {error && (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}

    <div className="space-y-2">
      <Label htmlFor="name">Shop Name</Label>
      <Input
        id="name"
        name="name"
        placeholder="Enter shop name"
        value={formData.name}
        onChange={handleInputChange}
        className={formErrors.name ? 'border-red-500' : ''}
        disabled={isSubmitting}
      />
      {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
    </div>

    <div className="space-y-2">
      <Label htmlFor="domain">Domain</Label>
      <div className="relative">
        <Input
          id="domain"
          name="domain"
          placeholder="Enter domain (e.g., myshop)"
          value={formData.domain}
          onChange={handleInputChange}
          className={`${formErrors.domain ? 'border-red-500' : formData.domain && !formErrors.domain && !isDomainChecking ? 'border-green-500' : ''} pr-32`}
          disabled={isSubmitting}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isDomainChecking && (
            <Loader2 className="w-3 h-3 animate-spin text-neutral-400" />
          )}
          <span className="text-sm text-neutral-500 pointer-events-none">
            .{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}
          </span>
        </div>
      </div>
      {formErrors.domain && <p className="text-sm text-red-500">{formErrors.domain}</p>}
      {mode === 'create' && formData.domain && !formErrors.domain && !isDomainChecking && (
        <p className="text-sm text-green-600">Domain is available</p>
      )}
    </div>

    {mode === 'create' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category_id?.toString() || ""}
          onValueChange={(value) => handleSelectChange('category_id', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className={formErrors.category_id ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.category_id && <p className="text-sm text-red-500">{formErrors.category_id}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={formData.currency}
          onValueChange={(value) => handleSelectChange('currency', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className={formErrors.currency ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(currencySymbols).map(([code, symbol]) => (
              <SelectItem key={code} value={code}>{code} ({symbol})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formErrors.currency && <p className="text-sm text-red-500">{formErrors.currency}</p>}
      </div>
    </div>}

    {/* Contact Information */}
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter shop email"
            value={formData.email}
            onChange={handleInputChange}
            className={formErrors.email ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={handleInputChange}
            className={formErrors.phone ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
        </div>
      </div>
    </div>

    {/* Address Information */}
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Address Information</h3>
      <div className="space-y-2">
        <Label htmlFor="address">Street Address</Label>
        <Input
          id="address"
          name="address"
          placeholder="Enter street address"
          value={formData.address}
          onChange={handleInputChange}
          className={formErrors.address ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {formErrors.address && <p className="text-sm text-red-500">{formErrors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            placeholder="Enter city"
            value={formData.city}
            onChange={handleInputChange}
            className={formErrors.city ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {formErrors.city && <p className="text-sm text-red-500">{formErrors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            name="state"
            placeholder="Enter state/province"
            value={formData.state}
            onChange={handleInputChange}
            className={formErrors.state ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {formErrors.state && <p className="text-sm text-red-500">{formErrors.state}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            name="postal_code"
            placeholder="Enter postal code"
            value={formData.postal_code}
            onChange={handleInputChange}
            className={formErrors.postal_code ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {formErrors.postal_code && <p className="text-sm text-red-500">{formErrors.postal_code}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          name="country"
          placeholder="Enter country"
          value={formData.country}
          onChange={handleInputChange}
          className={formErrors.country ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {formErrors.country && <p className="text-sm text-red-500">{formErrors.country}</p>}
      </div>
    </div>

    {/* Shipping Settings */}
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Shipping Settings</h3>
      <div className="space-y-2">
        <Label htmlFor="free_shipping_threshold">Free Shipping Threshold (Optional)</Label>
        <Input
          id="free_shipping_threshold"
          name="free_shipping_threshold"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter minimum amount for free shipping"
          value={formData.free_shipping_threshold || ''}
          onChange={handleInputChange}
          className={formErrors.free_shipping_threshold ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {formErrors.free_shipping_threshold && <p className="text-sm text-red-500">{formErrors.free_shipping_threshold}</p>}
        <p className="text-sm text-neutral-500">
          Orders above this amount will qualify for free shipping. Leave empty to disable free shipping.
        </p>
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        name="description"
        placeholder="Enter shop description"
        value={formData.description || ""}
        onChange={handleInputChange}
        className={formErrors.description ? 'border-red-500' : ''}
        disabled={isSubmitting}
        rows={3}
      />
      {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
    </div>

    <DialogFooter>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full md:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {submitLabel}...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </DialogFooter>
  </form>
);

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopWithOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<ShopWithOwner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Form state for editing shops only
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    category_id: undefined as number | undefined,
    description: '' as string | undefined,
    currency: 'USD',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    free_shipping_threshold: undefined as number | undefined,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDomainChecking, setIsDomainChecking] = useState(false);
  const [domainCheckTimeout, setDomainCheckTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (domainCheckTimeout) {
        clearTimeout(domainCheckTimeout);
      }
    };
  }, [domainCheckTimeout]);

  const checkDomainAvailability = async (domain: string) => {
    if (!domain || domain.length < 3) return;
    
    // Skip domain check in edit mode if domain hasn't changed
    if (selectedShop && selectedShop.domain === domain) return;
    
    try {
      setIsDomainChecking(true);
      const response = await axios.get(`/api/shops/check-domain?domain=${encodeURIComponent(domain)}`);
      
      if (!response.data.available) {
        setFormErrors(prev => ({ ...prev, domain: 'This domain is already taken' }));
      } else {
        // Clear domain error if it exists
        setFormErrors(prev => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { domain: _, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error('Domain check error:', error);
    } finally {
      setIsDomainChecking(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle number fields specially
    if (name === 'free_shipping_threshold') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === '' ? undefined : parseFloat(value) 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Debounced domain availability check
    if (name === 'domain') {
      // Clear existing timeout
      if (domainCheckTimeout) {
        clearTimeout(domainCheckTimeout);
      }

      // Set new timeout for domain check
      const timeout = setTimeout(() => {
        checkDomainAvailability(value);
      }, 500); // 500ms debounce

      setDomainCheckTimeout(timeout);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'currency') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    }
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      category_id: undefined,
      description: '',
      currency: 'USD',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      free_shipping_threshold: undefined,
    });
    setFormErrors({});
    setError('');
    setSuccess('');
  };



  const handleEditShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;

    setIsSubmitting(true);
    setError('');

    try {
      const validatedData = createShopSchema.parse(formData);
      
      // API call to update shop
      const response = await axios.put(`/api/shops/${selectedShop.domain}`, validatedData);
      
      const category = categories.find(cat => cat.id === response.data.category_id);
      // Update local state with the response data
      setShops(prev => prev.map(shop =>
        shop.id === selectedShop.id
          ? { ...response.data, category: category ? category.name : '' }
          : shop
      ));
      
      setSuccess('Shop updated successfully!');
      resetForm();
      setIsEditOpen(false);
      setSelectedShop(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(fieldErrors);
      } else if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to update shop. Please try again.');
      } else {
        setError('Failed to update shop. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const openEditModal = (shop: ShopWithOwner) => {
    setSelectedShop(shop);
    setFormData({
      name: shop.name,
      domain: shop.domain,
      category_id: shop.category_id,
      description: shop.description,
      currency: shop.currency,
      email: shop.email || '',
      phone: shop.phone || '',
      address: shop.address || '',
      city: shop.city || '',
      state: shop.state || '',
      postal_code: shop.postal_code || '',
      country: shop.country || '',
      free_shipping_threshold: shop.free_shipping_threshold,
    });
    setFormErrors({});
    setError('');
    setIsEditOpen(true);
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
      <AuthGuard />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(shop)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-3 h-3" />
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

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Shop</DialogTitle>
              <DialogDescription>
                Update your shop details
              </DialogDescription>
            </DialogHeader>
            <ShopForm 
              onSubmit={handleEditShop}
              mode='update'
              submitLabel="Update Shop"
              isSubmitting={isSubmitting}
              formData={formData}
              formErrors={formErrors}
              error={error}
              categories={categories}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
              isDomainChecking={isDomainChecking}
            />
          </DialogContent>
        </Dialog>

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
