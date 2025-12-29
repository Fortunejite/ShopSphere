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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  X,
  Sun,
  Moon,
  RefreshCw,
  Eye
} from 'lucide-react';
import { ProductLoading } from '@/components/Loading';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import { uploadPhoto } from '@/lib/uploadPhoto';
import { createShopSchema } from '@/lib/schema/shop';
import { colorTheme } from '@/models/Shop';
import Image from 'next/image';
import { updateShop } from '@/redux/shopSlice';

type ShopSettingsFormData = z.infer<typeof createShopSchema>;

export default function AdminSettingsPage() {
  const { domain } = useParams();
  const dispatch = useAppDispatch();
  const { shop } = useAppSelector(state => state.shop);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ 
    type: 'success' | 'error'; 
    title: string; 
    message: string; 
    show: boolean 
  } | null>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  
  // Theme state
  const [lightTheme, setLightTheme] = useState<colorTheme>({
    primary: '#171717',
    secondary: '#f5f5f5',
    background: '#ffffff',
    text: '#171717',
    accent: '#f5f5f5'
  });
  
  const [darkTheme, setDarkTheme] = useState<colorTheme>({
    primary: '#f5f5f5',
    secondary: '#404040',
    background: '#171717',
    text: '#f5f5f5',
    accent: '#404040'
  });
  
  const [activeThemeMode, setActiveThemeMode] = useState<'light' | 'dark'>('light');
  const [hasThemeChanges, setHasThemeChanges] = useState(false);

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

  // Toast notification helper
  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setToast({ type, title, message, show: true });
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, show: false } : null);
      setTimeout(() => setToast(null), 300); // Allow fade out animation
    }, 4000);
  };

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
      
      // Load theme data
      if (shop.light_theme) {
        setLightTheme(shop.light_theme);
      }
      if (shop.dark_theme) {
        setDarkTheme(shop.dark_theme);
      }
      
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
        showToast(
          'success',
          'Upload Successful!',
          `Your ${type === 'logo' ? 'logo' : 'banner'} has been uploaded successfully.`
        );
      } else {
        showToast('error', 'Upload Failed', result.error || 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      showToast(
        'error', 
        'Upload Error',
        error instanceof Error ? error.message : 'An unexpected error occurred during upload.'
      );
    } finally {
      const uploadSetter = type === 'logo' ? setIsLogoUploading : setIsBannerUploading;
      uploadSetter(false);
    }
  };

  const handleImageRemove = (type: 'logo' | 'banner') => {
    form.setValue(type, '');
    showToast(
      'success',
      'Image Removed',
      `${type === 'logo' ? 'Logo' : 'Banner'} has been removed successfully.`
    );
  };

  const handleThemeColorChange = (
    mode: 'light' | 'dark',
    property: keyof colorTheme,
    value: string
  ) => {
    setHasThemeChanges(true);
    
    if (mode === 'light') {
      setLightTheme(prev => ({ ...prev, [property]: value }));
    } else {
      setDarkTheme(prev => ({ ...prev, [property]: value }));
    }
  };

  const resetThemeToDefaults = () => {
    const defaultLight: colorTheme = {
      primary: '#171717',
      secondary: '#f5f5f5',
      background: '#ffffff',
      text: '#171717',
      accent: '#f5f5f5'
    };
    
    const defaultDark: colorTheme = {
      primary: '#f5f5f5',
      secondary: '#404040',
      background: '#171717',
      text: '#f5f5f5',
      accent: '#404040'
    };
    
    setLightTheme(defaultLight);
    setDarkTheme(defaultDark);
    setHasThemeChanges(true);
    
    showToast(
      'success',
      'Theme Reset',
      'Theme colors have been reset to defaults.'
    );
  };

  const onSubmit = async (data: ShopSettingsFormData) => {
    try {
      setIsSaving(true);

      // Include theme data in the submission
      const submitData = {
        ...data,
        light_theme: lightTheme,
        dark_theme: darkTheme
      };

      await axios.put(`/api/shops/${domain}`, submitData);
      showToast(
        'success',
        'Settings Updated!',
        'Your shop settings have been saved successfully.'
      );
      dispatch(updateShop(submitData));
      setHasThemeChanges(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast(
        'error',
        'Update Failed',
        'Failed to update your settings. Please check your connection and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <ProductLoading text="Loading shop settings..." fullPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Shop Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your shop configuration and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    <p className="text-sm text-error mt-1">
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
                    <p className="text-sm text-error mt-1">
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
                    <p className="text-sm text-error mt-1">
                      {form.formState.errors.tagline.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Your shop will be accessible at: /shops/{form.watch('domain')}
                  </p>
                  {form.formState.errors.domain && (
                    <p className="text-sm text-error mt-1">
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
                    <p className="text-sm text-error mt-1">
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
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                          className="w-20 h-20 object-cover rounded-lg border-2 border-border"
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
                      <div className="w-20 h-20 bg-muted border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
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
                      <p className="text-xs text-muted-foreground mt-2">
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
                          className="w-60 h-20 object-cover rounded-lg border-2 border-border"
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
                      <div className="w-60 h-20 bg-muted border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
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
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG up to 5MB. Recommended: 1200x400px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Theme Customization */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-medium">Theme Colors</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetThemeToDefaults}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  
                  <Tabs value={activeThemeMode} onValueChange={(value) => setActiveThemeMode(value as 'light' | 'dark')}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="light" className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Light Mode
                      </TabsTrigger>
                      <TabsTrigger value="dark" className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Dark Mode
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="light" className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Primary Color */}
                        <div>
                          <Label className="text-sm font-medium">Primary Color</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <div 
                              className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                              style={{ backgroundColor: lightTheme.primary }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = lightTheme.primary.startsWith('#') ? lightTheme.primary : '#000000';
                                input.addEventListener('change', (e) => {
                                  handleThemeColorChange('light', 'primary', (e.target as HTMLInputElement).value);
                                });
                                input.click();
                              }}
                            />
                            <Input
                              type="text"
                              value={lightTheme.primary}
                              onChange={(e) => handleThemeColorChange('light', 'primary', e.target.value)}
                              placeholder="#171717"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Main brand color for buttons and links</p>
                        </div>

                        {/* Secondary Color */}
                        <div>
                          <Label className="text-sm font-medium">Secondary Color</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <div 
                              className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                              style={{ backgroundColor: lightTheme.secondary }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = lightTheme.secondary.startsWith('#') ? lightTheme.secondary : '#f5f5f5';
                                input.addEventListener('change', (e) => {
                                  handleThemeColorChange('light', 'secondary', (e.target as HTMLInputElement).value);
                                });
                                input.click();
                              }}
                            />
                            <Input
                              type="text"
                              value={lightTheme.secondary}
                              onChange={(e) => handleThemeColorChange('light', 'secondary', e.target.value)}
                              placeholder="#f5f5f5"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Secondary backgrounds and muted elements</p>
                        </div>

                        {/* Background Color */}
                        <div>
                          <Label className="text-sm font-medium">Background Color</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <div 
                              className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                              style={{ backgroundColor: lightTheme.background }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = lightTheme.background.startsWith('#') ? lightTheme.background : '#ffffff';
                                input.addEventListener('change', (e) => {
                                  handleThemeColorChange('light', 'background', (e.target as HTMLInputElement).value);
                                });
                                input.click();
                              }}
                            />
                            <Input
                              type="text"
                              value={lightTheme.background}
                              onChange={(e) => handleThemeColorChange('light', 'background', e.target.value)}
                              placeholder="#ffffff"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Main page background color</p>
                        </div>

                        {/* Text Color */}
                        <div>
                          <Label className="text-sm font-medium">Text Color</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <div 
                              className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                              style={{ backgroundColor: lightTheme.text }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = lightTheme.text.startsWith('#') ? lightTheme.text : '#171717';
                                input.addEventListener('change', (e) => {
                                  handleThemeColorChange('light', 'text', (e.target as HTMLInputElement).value);
                                });
                                input.click();
                              }}
                            />
                            <Input
                              type="text"
                              value={lightTheme.text}
                              onChange={(e) => handleThemeColorChange('light', 'text', e.target.value)}
                              placeholder="#171717"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Primary text color</p>
                        </div>

                        {/* Accent Color */}
                        <div>
                          <Label className="text-sm font-medium">Accent Color</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <div 
                              className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                              style={{ backgroundColor: lightTheme.accent }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = lightTheme.accent.startsWith('#') ? lightTheme.accent : '#f5f5f5';
                                input.addEventListener('change', (e) => {
                                  handleThemeColorChange('light', 'accent', (e.target as HTMLInputElement).value);
                                });
                                input.click();
                              }}
                            />
                            <Input
                              type="text"
                              value={lightTheme.accent}
                              onChange={(e) => handleThemeColorChange('light', 'accent', e.target.value)}
                              placeholder="#f5f5f5"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Accent color for highlights and special elements</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="dark" className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {/* Primary Color */}
                        <div>
                          <Label className="text-sm font-medium">Primary Color</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <div 
                              className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                              style={{ backgroundColor: darkTheme.primary }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = darkTheme.primary.startsWith('#') ? darkTheme.primary : '#f5f5f5';
                                input.addEventListener('change', (e) => {
                                  handleThemeColorChange('dark', 'primary', (e.target as HTMLInputElement).value);
                                });
                                input.click();
                              }}
                            />
                            <Input
                              type="text"
                              value={darkTheme.primary}
                              onChange={(e) => handleThemeColorChange('dark', 'primary', e.target.value)}
                              placeholder="#f5f5f5"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Main brand color for buttons and links</p>
                        </div>

                        {/* Secondary Color */}
                        <div>
                          <Label className="text-sm font-medium">Secondary Color</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <div 
                              className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                              style={{ backgroundColor: darkTheme.secondary }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = darkTheme.secondary.startsWith('#') ? darkTheme.secondary : '#404040';
                                input.addEventListener('change', (e) => {
                                  handleThemeColorChange('dark', 'secondary', (e.target as HTMLInputElement).value);
                                });
                                input.click();
                              }}
                            />
                            <Input
                              type="text"
                              value={darkTheme.secondary}
                              onChange={(e) => handleThemeColorChange('dark', 'secondary', e.target.value)}
                              placeholder="#404040"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Secondary backgrounds and muted elements</p>
                        </div>

                        {/* Background Color */}
                        <div>
                          <Label className="text-sm font-medium">Background Color</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <div 
                              className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                              style={{ backgroundColor: darkTheme.background }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = darkTheme.background.startsWith('#') ? darkTheme.background : '#171717';
                                input.addEventListener('change', (e) => {
                                  handleThemeColorChange('dark', 'background', (e.target as HTMLInputElement).value);
                                });
                                input.click();
                              }}
                            />
                            <Input
                              type="text"
                              value={darkTheme.background}
                              onChange={(e) => handleThemeColorChange('dark', 'background', e.target.value)}
                              placeholder="#171717"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Main page background color</p>
                        </div>

                        {/* Text Color */}
                        <div>
                          <Label className="text-sm font-medium">Text Color</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <div 
                              className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                              style={{ backgroundColor: darkTheme.text }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = darkTheme.text.startsWith('#') ? darkTheme.text : '#f5f5f5';
                                input.addEventListener('change', (e) => {
                                  handleThemeColorChange('dark', 'text', (e.target as HTMLInputElement).value);
                                });
                                input.click();
                              }}
                            />
                            <Input
                              type="text"
                              value={darkTheme.text}
                              onChange={(e) => handleThemeColorChange('dark', 'text', e.target.value)}
                              placeholder="#f5f5f5"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Primary text color</p>
                        </div>

                        {/* Accent Color */}
                        <div>
                          <Label className="text-sm font-medium">Accent Color</Label>
                          <div className="flex items-center space-x-3 mt-2">
                            <div 
                              className="w-10 h-10 rounded-md border-2 border-border cursor-pointer"
                              style={{ backgroundColor: darkTheme.accent }}
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'color';
                                input.value = darkTheme.accent.startsWith('#') ? darkTheme.accent : '#404040';
                                input.addEventListener('change', (e) => {
                                  handleThemeColorChange('dark', 'accent', (e.target as HTMLInputElement).value);
                                });
                                input.click();
                              }}
                            />
                            <Input
                              type="text"
                              value={darkTheme.accent}
                              onChange={(e) => handleThemeColorChange('dark', 'accent', e.target.value)}
                              placeholder="#404040"
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Accent color for highlights and special elements</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Theme Preview */}
                  <div className="mt-6 border rounded-lg p-4" style={{
                    backgroundColor: activeThemeMode === 'light' ? lightTheme.background : darkTheme.background,
                    color: activeThemeMode === 'light' ? lightTheme.text : darkTheme.text
                  }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Theme Preview</h3>
                      <Eye className="w-5 h-5" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div 
                        className="p-3 rounded-lg text-center"
                        style={{ 
                          backgroundColor: activeThemeMode === 'light' ? lightTheme.primary : darkTheme.primary, 
                          color: activeThemeMode === 'light' ? lightTheme.background : darkTheme.background 
                        }}
                      >
                        <p className="font-medium text-sm">Primary</p>
                      </div>
                      
                      <div 
                        className="p-3 rounded-lg text-center"
                        style={{ 
                          backgroundColor: activeThemeMode === 'light' ? lightTheme.secondary : darkTheme.secondary, 
                          color: activeThemeMode === 'light' ? lightTheme.text : darkTheme.text 
                        }}
                      >
                        <p className="font-medium text-sm">Secondary</p>
                      </div>
                      
                      <div 
                        className="p-3 rounded-lg text-center"
                        style={{ 
                          backgroundColor: activeThemeMode === 'light' ? lightTheme.accent : darkTheme.accent, 
                          color: activeThemeMode === 'light' ? lightTheme.text : darkTheme.text 
                        }}
                      >
                        <p className="font-medium text-sm">Accent</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        className="px-4 py-2 rounded-md font-medium text-sm"
                        style={{ 
                          backgroundColor: activeThemeMode === 'light' ? lightTheme.primary : darkTheme.primary, 
                          color: activeThemeMode === 'light' ? lightTheme.background : darkTheme.background 
                        }}
                      >
                        Primary Button
                      </button>
                      <button 
                        className="px-4 py-2 rounded-md font-medium text-sm border"
                        style={{ 
                          backgroundColor: 'transparent', 
                          color: activeThemeMode === 'light' ? lightTheme.primary : darkTheme.primary,
                          borderColor: activeThemeMode === 'light' ? lightTheme.primary : darkTheme.primary
                        }}
                      >
                        Secondary Button
                      </button>
                    </div>
                  </div>

                  {hasThemeChanges && (
                    <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
                      <p className="text-sm text-info-foreground">
                        You have unsaved theme changes. Click &quot;Save Settings&quot; to apply them.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving || isLogoUploading || isBannerUploading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
          toast.show ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}>
          <div className={`max-w-md w-full rounded-lg shadow-lg p-4 ${
            toast.type === 'success' 
              ? 'bg-success/10 border-l-4 border-success' 
              : 'bg-error/10 border-l-4 border-error'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-error" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-semibold ${
                  toast.type === 'success' ? 'text-success-foreground' : 'text-error-foreground'
                }`}>
                  {toast.title}
                </p>
                <p className={`text-sm mt-1 ${
                  toast.type === 'success' ? 'text-success-foreground' : 'text-error-foreground'
                }`}>
                  {toast.message}
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={() => setToast(prev => prev ? { ...prev, show: false } : null)}
                  className={`rounded-md inline-flex ${
                    toast.type === 'success' 
                      ? 'text-success hover:text-success/80 focus:ring-success' 
                      : 'text-error hover:text-error/80 focus:ring-error'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
