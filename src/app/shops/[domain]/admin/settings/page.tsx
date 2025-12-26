'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings,
  Store,
  Palette,
  Mail,
  Save,
  AlertCircle,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  Loader2,
  X
} from 'lucide-react';
import { ProductLoading } from '@/components/Loading';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import { uploadPhoto } from '@/lib/uploadPhoto';
import { createShopSchema } from '@/lib/schema/shop';
import Image from 'next/image';
import { updateShop } from '@/redux/shopSlice';

type ShopSettingsFormData = z.infer<typeof createShopSchema>;

export default function AdminSettingsPage() {
  const { domain } = useParams();
  const dispatch = useAppDispatch();
  const { shop } = useAppSelector(state => state.shop);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);

  const form = useForm<ShopSettingsFormData>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      name: '',
      description: '',
      tagline: '',
      domain: '',
      currency: 'USD',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      free_shipping_threshold: 50,
      logo: '',
      banner: '',
      category_id: 1, // Default category, will be updated when shop data loads
    }
  });

  useEffect(() => {
    if (shop) {
      form.reset({
        name: shop.name || '',
        description: shop.description || '',
        tagline: shop.tagline || '',
        domain: shop.domain || '',
        currency: shop.currency || 'USD',
        email: shop.email || '',
        phone: shop.phone || '',
        address: shop.address || '',
        city: shop.city || '',
        state: shop.state || '',
        postal_code: shop.postal_code || '',
        country: shop.country || 'US',
        free_shipping_threshold: shop.free_shipping_threshold || 50,
        logo: shop.logo || '',
        banner: shop.banner || '',
        category_id: shop.category_id || 1,
      });
      setIsLoading(false);
    }
  }, [shop, form]);

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    try {
      const uploadSetter = type === 'logo' ? setIsLogoUploading : setIsBannerUploading;
      uploadSetter(true);

      const result = await uploadPhoto(file);
      
      if (result.success) {
        form.setValue(type, result.url);
        setMessage({ type: 'success', text: `${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully!` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Upload failed' 
      });
    } finally {
      const uploadSetter = type === 'logo' ? setIsLogoUploading : setIsBannerUploading;
      uploadSetter(false);
    }
  };

  const handleImageRemove = (type: 'logo' | 'banner') => {
    form.setValue(type, '');
    setMessage({ type: 'success', text: `${type === 'logo' ? 'Logo' : 'Banner'} removed successfully!` });
    setTimeout(() => setMessage(null), 3000);
  };

  const onSubmit = async (data: ShopSettingsFormData) => {
    try {
      setIsSaving(true);
      setMessage(null);

      await axios.put(`/api/shops/${domain}`, data);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
      dispatch(updateShop(data));
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <ProductLoading text="Loading shop settings..." fullPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Shop Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your shop configuration and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Success/Error Messages */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Shop Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="My Awesome Shop"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Describe your shop and what you sell..."
                    rows={3}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    {...form.register('tagline')}
                    placeholder="Enter a catchy tagline for your shop"
                  />
                  {form.formState.errors.tagline && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.tagline.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    A short, memorable phrase that captures your shop&apos;s essence (max 100 characters)
                  </p>
                </div>

                <div>
                  <Label htmlFor="domain">Shop Domain *</Label>
                  <Input
                    id="domain"
                    {...form.register('domain')}
                    placeholder="myshop"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your shop will be accessible at: /shops/{form.watch('domain')}
                  </p>
                  {form.formState.errors.domain && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.domain.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="contact@myshop.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...form.register('address')}
                    placeholder="123 Business St"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...form.register('city')}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...form.register('state')}
                      placeholder="NY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      {...form.register('postal_code')}
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <select
                      id="country"
                      {...form.register('country')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <Label>Shop Logo</Label>
                  <div className="mt-3">
                    {form.watch('logo') ? (
                      <div className="relative inline-block">
                        <Image
                          src={form.watch('logo') ?? ''}
                          alt="Shop logo"
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                          onClick={() => handleImageRemove('logo')}
                          disabled={isSaving}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'logo');
                        }}
                        disabled={isSaving || isLogoUploading}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        disabled={isSaving || isLogoUploading}
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
                              Upload Logo
                            </>
                          )}
                        </label>
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG up to 5MB. Recommended: 200x200px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div>
                  <Label>Banner Image</Label>
                  <div className="mt-3">
                    {form.watch('banner') ? (
                      <div className="relative inline-block">
                        <Image
                          src={form.watch('banner') ?? ''}
                          alt="Shop banner"
                          width={240}
                          height={80}
                          className="w-60 h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                          onClick={() => handleImageRemove('banner')}
                          disabled={isSaving}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-60 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'banner');
                        }}
                        disabled={isSaving || isBannerUploading}
                        className="hidden"
                        id="banner-upload"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        disabled={isSaving || isBannerUploading}
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
                              Upload Banner
                            </>
                          )}
                        </label>
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG up to 5MB. Recommended: 1200x400px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Theme Color */}
                <div>
                  <Label>Theme Color</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <input
                      type="color"
                      defaultValue="#000000"
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Primary color for buttons and accents
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
