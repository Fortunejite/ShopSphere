'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Store,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  ImageIcon
} from 'lucide-react';
import { createShopSchema } from '@/lib/schema/shop';
import { currencySymbols } from '@/lib/currency';
import { z } from 'zod';
import axios from 'axios';
import { useAppSelector } from '@/hooks/redux.hook';
import { uploadPhoto } from '@/lib/uploadPhoto';
import Image from 'next/image';

export default function NewShopPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    category_id: undefined as number | undefined,
    description: '' as string | undefined,
    tagline: '' as string | undefined,
    currency: 'USD',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    free_shipping_threshold: undefined as number | undefined,
    logo: '',
    banner: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDomainChecking, setIsDomainChecking] = useState(false);
  const [domainCheckTimeout, setDomainCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);

  const categoriesState = useAppSelector(state => state.category.categories);
  const categories = categoriesState.filter(cat => cat.parent_id === null);

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

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    try {
      const uploadSetter = type === 'logo' ? setIsLogoUploading : setIsBannerUploading;
      uploadSetter(true);

      const result = await uploadPhoto(file);
      
      if (result.success) {
        setFormData(prev => ({ ...prev, [type]: result.url }));
        // Clear any existing error for this field
        setFormErrors(prev => ({ ...prev, [type]: '' }));
      } else {
        setFormErrors(prev => ({ ...prev, [type]: result.error || 'Upload failed' }));
      }
    } catch (error) {
      setFormErrors(prev => ({ 
        ...prev, 
        [type]: error instanceof Error ? error.message : 'Upload failed' 
      }));
    } finally {
      const uploadSetter = type === 'logo' ? setIsLogoUploading : setIsBannerUploading;
      uploadSetter(false);
    }
  };

  const handleImageRemove = (type: 'logo' | 'banner') => {
    setFormData(prev => ({ ...prev, [type]: '' }));
    setFormErrors(prev => ({ ...prev, [type]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const validatedData = createShopSchema.parse(formData);
      await axios.post('/api/shops', validatedData);
      
      setSuccess('Shop created successfully!');
      
      // Redirect to shops page after a brief delay
      setTimeout(() => {
        router.push('/shops');
      }, 1500);
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
        setError(error.response?.data?.message || 'Failed to create shop. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/shops">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shops
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Shop</h1>
                <p className="text-gray-600">Fill in the details to create your online store</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Shop Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Shop Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your shop name"
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
                      placeholder="Enter your shop domain (e.g., myshop)"
                      value={formData.domain}
                      onChange={handleInputChange}
                      className={`${formErrors.domain ? 'border-red-500' : formData.domain && !formErrors.domain && !isDomainChecking ? 'border-green-500' : ''} pr-40`}
                      disabled={isSubmitting}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {isDomainChecking && (
                        <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                      )}
                      <span className="text-sm text-neutral-500 pointer-events-none">
                        .{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}
                      </span>
                    </div>
                  </div>
                  {formErrors.domain && <p className="text-sm text-red-500">{formErrors.domain}</p>}
                  {formData.domain && !formErrors.domain && !isDomainChecking && (
                    <p className="text-sm text-green-600">✓ Domain is available</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id?.toString() || ""}
                      onValueChange={(value) => handleSelectChange('category_id', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={formErrors.category_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your shop and what you sell..."
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    className={formErrors.description ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                    rows={4}
                  />
                  {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline (Optional)</Label>
                  <Input
                    id="tagline"
                    name="tagline"
                    placeholder="Enter a catchy tagline for your shop"
                    value={formData.tagline || ""}
                    onChange={handleInputChange}
                    className={formErrors.tagline ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {formErrors.tagline && <p className="text-sm text-red-500">{formErrors.tagline}</p>}
                  <p className="text-sm text-gray-500">
                    A short, memorable phrase that captures your shop&apos;s essence (max 100 characters)
                  </p>
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Shop Logo (Optional)</Label>
                  <div className="space-y-4">
                    {formData.logo ? (
                      <div className="relative inline-block">
                        <Image
                          src={formData.logo}
                          alt="Shop logo"
                          width={120}
                          height={120}
                          className="w-30 h-30 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                          onClick={() => handleImageRemove('logo')}
                          disabled={isSubmitting}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-3">Upload your shop logo</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'logo');
                          }}
                          disabled={isSubmitting || isLogoUploading}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSubmitting || isLogoUploading}
                          asChild
                        >
                          <label htmlFor="logo-upload" className="cursor-pointer">
                            {isLogoUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Choose File
                              </>
                            )}
                          </label>
                        </Button>
                      </div>
                    )}
                  </div>
                  {formErrors.logo && <p className="text-sm text-red-500">{formErrors.logo}</p>}
                  <p className="text-sm text-gray-500">
                    Recommended: Square image, minimum 200x200px. Max file size: 5MB.
                  </p>
                </div>

                {/* Banner Upload */}
                <div className="space-y-2">
                  <Label>Shop Banner (Optional)</Label>
                  <div className="space-y-4">
                    {formData.banner ? (
                      <div className="relative inline-block">
                        <Image
                          src={formData.banner}
                          alt="Shop banner"
                          width={400}
                          height={150}
                          className="w-full max-w-md h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                          onClick={() => handleImageRemove('banner')}
                          disabled={isSubmitting}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-3">Upload your shop banner</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'banner');
                          }}
                          disabled={isSubmitting || isBannerUploading}
                          className="hidden"
                          id="banner-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSubmitting || isBannerUploading}
                          asChild
                        >
                          <label htmlFor="banner-upload" className="cursor-pointer">
                            {isBannerUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Choose File
                              </>
                            )}
                          </label>
                        </Button>
                      </div>
                    )}
                  </div>
                  {formErrors.banner && <p className="text-sm text-red-500">{formErrors.banner}</p>}
                  <p className="text-sm text-gray-500">
                    Recommended: Wide format image, minimum 800x300px. Max file size: 5MB.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter shop email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
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
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">Address Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter your street address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={formErrors.address ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {formErrors.address && <p className="text-sm text-red-500">{formErrors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      placeholder="Enter state or province"
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
              <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">Shipping Settings</h3>
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
                  {formErrors.free_shipping_threshold && (
                    <p className="text-sm text-red-500">{formErrors.free_shipping_threshold}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Orders above this amount will qualify for free shipping. Leave empty to disable free shipping.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                  <Link href="/shops">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-32">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Shop'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
