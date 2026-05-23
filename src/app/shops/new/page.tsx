'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
import { uploadPhoto } from '@/lib/uploadPhoto';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function NewShopPage() {
  const { status: authStatus } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    description: '' as string | undefined,
    tagline: '' as string | undefined,
    currency: 'USD',
    email: '',
    phone: '',
    address: '',
    state: '',
    postal_code: '',
    country: '',
    logo: '',
    banner: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isDomainChecking, setIsDomainChecking] = useState(false);
  const [domainCheckTimeout, setDomainCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);

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

  if (authStatus === 'loading') {
    return null
  }

  if (authStatus === 'unauthenticated') {
    router.push(`/login?next=${pathname}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
            <Button variant="ghost" size="sm" asChild className="w-fit px-0 sm:px-3">
              <Link href="/shops">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shops
              </Link>
            </Button>
            <div className="flex items-start gap-3 sm:items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Create New Shop</h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                  Fill in the details to create your online store.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          <Alert className="border-success bg-success/10">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-success/80">{success}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Card>
          <CardHeader className="px-4 sm:px-6 py-5 sm:py-6">
            <CardTitle>Shop Information</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
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
                    className={formErrors.name ? 'border-error' : ''}
                    disabled={isSubmitting}
                  />
                  {formErrors.name && <p className="text-sm text-error">{formErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <div className="relative flex flex-col gap-2 sm:block">
                    <Input
                      id="domain"
                      name="domain"
                      placeholder="Enter your shop domain (e.g., myshop)"
                      value={formData.domain}
                      onChange={handleInputChange}
                      className={`${formErrors.domain ? 'border-error' : formData.domain && !formErrors.domain && !isDomainChecking ? 'border-success' : ''} pr-4 sm:pr-40`}
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2 sm:text-sm">
                      {isDomainChecking && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                      <span className="pointer-events-none break-all sm:whitespace-nowrap">
                        .{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}
                      </span>
                    </div>
                  </div>
                  {formErrors.domain && <p className="text-sm text-error">{formErrors.domain}</p>}
                  {formData.domain && !formErrors.domain && !isDomainChecking && (
                    <p className="text-sm text-success">✓ Domain is available</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => handleSelectChange('currency', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={formErrors.currency ? 'border-error' : ''}>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(currencySymbols).map(([code, symbol]) => (
                          <SelectItem key={code} value={code}>{code} ({symbol})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.currency && <p className="text-sm text-error">{formErrors.currency}</p>}
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
                    className={formErrors.description ? 'border-error' : ''}
                    disabled={isSubmitting}
                    rows={4}
                  />
                  {formErrors.description && <p className="text-sm text-error">{formErrors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline (Optional)</Label>
                  <Input
                    id="tagline"
                    name="tagline"
                    placeholder="Enter a catchy tagline for your shop"
                    value={formData.tagline || ""}
                    onChange={handleInputChange}
                    className={formErrors.tagline ? 'border-error' : ''}
                    disabled={isSubmitting}
                  />
                  {formErrors.tagline && <p className="text-sm text-error">{formErrors.tagline}</p>}
                  <p className="text-sm text-gray-500">
                    A short, memorable phrase that captures your shop&apos;s essence (max 100 characters)
                  </p>
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Shop Logo (Optional)</Label>
                  <div className="space-y-4">
                    {formData.logo ? (
                      <div className="relative w-full max-w-40 sm:max-w-48">
                        <Image
                          src={formData.logo}
                          alt="Shop logo"
                          width={120}
                          height={120}
                          className="h-32 w-32 sm:h-36 sm:w-36 object-cover rounded-lg border-2 border-gray-200"
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
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-gray-400 transition-colors">
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
                          className="w-full sm:w-auto"
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
                      <div className="relative w-full">
                        <Image
                          src={formData.banner}
                          alt="Shop banner"
                          width={400}
                          height={150}
                          className="w-full h-32 sm:h-36 object-cover rounded-lg border-2 border-gray-200"
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
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-gray-400 transition-colors">
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
                          className="w-full sm:w-auto"
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

                  <div className="space-y-2 md:col-span-2">
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
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4 sm:pt-6 sm:border-t">
                <Button type="button" variant="outline" asChild disabled={isSubmitting} className="w-full sm:w-auto">
                  <Link href="/shops">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting || isLogoUploading || isBannerUploading} className="w-full sm:w-auto sm:min-w-32">
                  {isLogoUploading || isBannerUploading ? 'Uploading Image...' :
                  isSubmitting ? (
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
