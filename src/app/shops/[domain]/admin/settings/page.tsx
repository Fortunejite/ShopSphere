'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Settings,
  Store,
  Palette,
  Mail,
  Save,
  Upload,
  CreditCard,
  ExternalLink,
  Landmark,
  Image as ImageIcon,
  Loader2,
  X,
} from 'lucide-react';
import { ProductLoading } from '@/components/Loading';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import { uploadPhoto } from '@/lib/uploadPhoto';
import { accountConnectSchema } from '@/lib/schema/paystack';
import { createShopSchema } from '@/lib/schema/shop';
import { formatCurrency } from '@/lib/currency';
import Image from 'next/image';
import { updateShop } from '@/redux/shopSlice';
import { Bank, PaystackSubAccount } from '@/types';
import ThemeCustomizer from '@/components/ThemeCustomizer';
import { generateURL } from '@/lib/domain';
import { colorTheme } from '@/lib/customTheme';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ShopSettingsFormData = z.infer<typeof createShopSchema>;
type PaystackConnectFormData = z.infer<typeof accountConnectSchema>;

interface PaystackTransactionRow {
  id: number;
  reference_id: string | null;
  tracking_id: string | null;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  status: 'pending' | 'success' | 'failed';
  created_at: string;
}

export default function AdminSettingsPage() {
  const { domain } = useParams();
  const shopDomain = Array.isArray(domain) ? domain[0] : domain;
  const dispatch = useAppDispatch();
  const { shop } = useAppSelector(state => state.shop);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [isStripeActionLoading, setIsStripeActionLoading] = useState(false);
  const [isPaystackLoading, setIsPaystackLoading] = useState(false);
  const [isCreatingPaystackAccount, setIsCreatingPaystackAccount] = useState(false);
  const [isUpdatingPaystackAccount, setIsUpdatingPaystackAccount] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankSearch, setBankSearch] = useState('');
  const [paystackSubAccount, setPaystackSubAccount] = useState<PaystackSubAccount | null>(null);
  const [showPaystackUpdateForm, setShowPaystackUpdateForm] = useState(false);
  const [transactions, setTransactions] = useState<PaystackTransactionRow[]>([]);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(1);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  
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
  
  const [hasThemeChanges, setHasThemeChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'appearance' | 'payments'>('basic');

  // Note: using `sonner` for toasts instead of local toast state
  const form = useForm<ShopSettingsFormData>({
    resolver: zodResolver(createShopSchema),
    defaultValues: {
      name: '',
      description: '',
      tagline: '',
      domain: '',
      currency: 'NGN',
      email: '',
      phone: '',
      address: '',
      logo: '',
      banner: '',
    }
  });

  const paystackForm = useForm<PaystackConnectFormData>({
    resolver: zodResolver(accountConnectSchema),
    defaultValues: {
      bankCode: '',
      accountNumber: '',
    },
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
        logo: shop.logo || '',
        banner: shop.banner || '',
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
        toast.success(`Your ${type === 'logo' ? 'logo' : 'banner'} has been uploaded successfully.`);
      } else {
        toast.error(result.error || 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred during upload.');
    } finally {
      const uploadSetter = type === 'logo' ? setIsLogoUploading : setIsBannerUploading;
      uploadSetter(false);
    }
  };

  const handleImageRemove = (type: 'logo' | 'banner') => {
    form.setValue(type, '');
    toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} has been removed successfully.`);
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
// Core colors — ShopSphere “Meridian Commerce” theme
primary:    'oklch(0.44 0.13 156)',  // deep emerald
secondary:  'oklch(0.96 0.022 84)',  // soft gold-tint surface
background: 'oklch(0.99 0.008 84)',  // warm ivory
text:       'oklch(0.15 0.015 258)', // deep ink
accent:     'oklch(0.95 0.045 84)',  // warm amber surface


  // Clear all optional colors to use defaults
  primaryForeground: undefined,
  secondaryForeground: undefined,
  accentForeground: undefined,
  card: undefined,
  cardForeground: undefined,
  popover: undefined,
  popoverForeground: undefined,
  muted: undefined,
  mutedForeground: undefined,
  border: undefined,
  input: undefined,
  ring: undefined,
  destructive: undefined,
  destructiveForeground: undefined,
  success: undefined,
  successForeground: undefined,
  warning: undefined,
  warningForeground: undefined,
  error: undefined,
  errorForeground: undefined,
  info: undefined,
  infoForeground: undefined,
  sidebar: undefined,
  sidebarForeground: undefined,
  sidebarPrimary: undefined,
  sidebarPrimaryForeground: undefined,
  sidebarAccent: undefined,
  sidebarAccentForeground: undefined,
  sidebarBorder: undefined,
  sidebarRing: undefined,
};

const defaultDark: colorTheme = {
  // Core colors — ShopSphere "Meridian Commerce" dark theme
  primary:    'oklch(0.60 0.14 157)',  // lighter emerald for dark surfaces
  secondary:  'oklch(0.22 0.018 258)', // dark neutral surface
  background: 'oklch(0.12 0.018 258)', // ink navy
  text:       'oklch(0.96 0.010 82)',  // warm cream
  accent:     'oklch(0.28 0.04 84)',   // subtle dark amber fill

  // Clear all optional colors to use defaults
  primaryForeground: undefined,
  secondaryForeground: undefined,
  accentForeground: undefined,
  card: undefined,
  cardForeground: undefined,
  popover: undefined,
  popoverForeground: undefined,
  muted: undefined,
  mutedForeground: undefined,
  border: undefined,
  input: undefined,
  ring: undefined,
  destructive: undefined,
  destructiveForeground: undefined,
  success: undefined,
  successForeground: undefined,
  warning: undefined,
  warningForeground: undefined,
  error: undefined,
  errorForeground: undefined,
  info: undefined,
  infoForeground: undefined,
  sidebar: undefined,
  sidebarForeground: undefined,
  sidebarPrimary: undefined,
  sidebarPrimaryForeground: undefined,
  sidebarAccent: undefined,
  sidebarAccentForeground: undefined,
  sidebarBorder: undefined,
  sidebarRing: undefined,
};

setLightTheme(defaultLight);
setDarkTheme(defaultDark);
setHasThemeChanges(true);
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

      await axios.put(`/api/shops/${shopDomain}`, submitData);
      toast.success('Your shop settings have been saved successfully.');
      dispatch(updateShop(submitData));
      setHasThemeChanges(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update your settings. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredBanks = banks.filter((bank) =>
    `${bank.name} ${bank.code}`.toLowerCase().includes(bankSearch.toLowerCase()),
  );

  const selectedBankCode = paystackForm.watch('bankCode');
  const selectedBank = banks.find((bank) => bank.code === selectedBankCode);

  const fetchPaystackBanks = useCallback(async () => {
    if (!shopDomain) return;
    try {
      const { data } = await axios.get(`/api/shops/${shopDomain}/paystack/banks`);
      setBanks(data?.banks ?? []);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast.error('Unable to load banks. Please refresh and try again.');
    }
  }, [shopDomain]);

  const fetchPaystackSubAccount = useCallback(async () => {
    if (!shopDomain) return;

    try {
      setIsPaystackLoading(true);
      const { data } = await axios.get(`/api/shops/${shopDomain}/paystack/sub-account`);
      setPaystackSubAccount(data as PaystackSubAccount);
      paystackForm.setValue('accountNumber', data?.account_number ?? '');
    } catch (error) {
      console.error('Error fetching Paystack sub-account:', error);
      toast.error('Unable to load Paystack account details.');
    } finally {
      setIsPaystackLoading(false);
    }
  }, [shopDomain, paystackForm]);

  const fetchPaystackTransactions = useCallback(
    async (page: number) => {
      if (!shopDomain) return;

      try {
        setIsTransactionsLoading(true);
        const { data } = await axios.get(`/api/shops/${shopDomain}/admin/paystack/transactions`, {
          params: {
            page,
            limit: 10,
          },
        });

        setTransactions((data?.transactions ?? []) as PaystackTransactionRow[]);
        setTransactionsTotalPages(data?.pagination?.totalPages ?? 1);
        setTransactionsTotal(data?.pagination?.total ?? 0);
      } catch (error) {
        console.error('Error fetching Paystack transactions:', error);
        setTransactions([]);
        setTransactionsTotalPages(1);
        setTransactionsTotal(0);
        toast.error('Unable to load Paystack transactions.');
      } finally {
        setIsTransactionsLoading(false);
      }
    },
    [shopDomain],
  );

  const handleCreatePaystackAccount = async (data: PaystackConnectFormData) => {
    if (!shopDomain) return;

    try {
      setIsCreatingPaystackAccount(true);
      const response = await axios.post(`/api/shops/${shopDomain}/paystack/sub-account`, data);
      const account = response.data?.account;

      setPaystackSubAccount({
        account_number: account?.account_number ?? data.accountNumber,
        settlement_bank: account?.settlement_bank ?? selectedBank?.name ?? data.bankCode,
      });

      dispatch(updateShop({ paystack_account_connected: true }));
      toast.success('Paystack sub-account connected successfully.');
      setShowPaystackUpdateForm(false);
    } catch (error) {
      console.error('Error creating Paystack sub-account:', error);
      toast.error('Failed to connect Paystack sub-account. Please verify details and try again.');
    } finally {
      setIsCreatingPaystackAccount(false);
    }
  };

  const handleUpdatePaystackAccount = async (data: PaystackConnectFormData) => {
    if (!shopDomain) return;

    try {
      setIsUpdatingPaystackAccount(true);
      const response = await axios.put(`/api/shops/${shopDomain}/paystack/sub-account`, data);
      const account = response.data?.account;

      setPaystackSubAccount({
        account_number: account?.account_number ?? data.accountNumber,
        settlement_bank: account?.settlement_bank ?? selectedBank?.name ?? data.bankCode,
      });

      toast.success('Paystack account updated successfully.');
      setShowPaystackUpdateForm(false);
    } catch (error) {
      console.error('Error updating Paystack sub-account:', error);
      toast.error('Failed to update Paystack account.');
    } finally {
      setIsUpdatingPaystackAccount(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!shopDomain) return;

    try {
      setIsStripeActionLoading(true);
      const { data } = await axios.get(`/api/shops/${shopDomain}/stripe/genetate-acount-link`);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error connecting Stripe account:', error);
      toast.error('Failed to connect Stripe. Please try again.');
      setIsStripeActionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'payments' || !shopDomain) return;

    if (banks.length === 0) {
      fetchPaystackBanks();
    }

    if (shop?.paystack_account_connected && !paystackSubAccount && !isPaystackLoading) {
      fetchPaystackSubAccount();
    }
  }, [
    activeTab,
    shopDomain,
    shop?.paystack_account_connected,
    banks.length,
    paystackSubAccount,
    isPaystackLoading,
    fetchPaystackBanks,
    fetchPaystackSubAccount,
  ]);

  useEffect(() => {
    if (activeTab !== 'payments' || !shopDomain || !shop?.paystack_account_connected) {
      return;
    }

    fetchPaystackTransactions(transactionsPage);
  }, [
    activeTab,
    shopDomain,
    shop?.paystack_account_connected,
    transactionsPage,
    fetchPaystackTransactions,
  ]);

  if (isLoading) {
    return <ProductLoading text="Loading shop settings..." fullPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border-b border-border">
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-0">
          {/* Sidebar */}
          <aside className="w-full md:w-56 md:sticky md:top-20">
            <nav className="flex md:flex-col gap-2 overflow-auto" role="tablist" aria-orientation="vertical">
              <button
                role="tab"
                aria-selected={activeTab === 'basic'}
                onClick={() => setActiveTab('basic')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${activeTab === 'basic' ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}>
                <Store className="w-4 h-4" />
                Basic
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'contact'}
                onClick={() => setActiveTab('contact')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${activeTab === 'contact' ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}>
                <Mail className="w-4 h-4" />
                Contact
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'appearance'}
                onClick={() => setActiveTab('appearance')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${activeTab === 'appearance' ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}>
                <Palette className="w-4 h-4" />
                Appearance
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'payments'}
                onClick={() => setActiveTab('payments')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${activeTab === 'payments' ? 'bg-muted font-semibold' : 'hover:bg-muted'}`}>
                <CreditCard className="w-4 h-4" />
                Payments
              </button>
            </nav>
          </aside>
  
          {/* Main content / form */}
          <main className="flex-1">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Basic tab */}
                {activeTab === 'basic' && (
                  <section id="basic" className="bg-card/70 p-6 pt-0 rounded-md">
                    <div className="mb-3">
                      <h2 className="text-lg font-semibold flex items-center gap-2"><Store className="w-5 h-5" /> Basic Information</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Shop Name *</Label>
                        <Input id="name" {...form.register('name')} placeholder="My Awesome Shop" />
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
                          Your shop will be accessible at: {generateURL(form.watch('domain'))}
                        </p>
                        {form.formState.errors.domain && (
                          <p className="text-sm text-error mt-1">
                            {form.formState.errors.domain.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {/* Contact tab */}
                {activeTab === 'contact' && (
                  <section id="contact" className="bg-card/70 p-6 pt-0 rounded-md">
                    <div className="mb-3">
                      <h2 className="text-lg font-semibold flex items-center gap-2"><Mail className="w-5 h-5" /> Contact Information</h2>
                    </div>
                    <div className="space-y-4">
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
                     </div>
                   </section>
                )}

                {/* Appearance tab */}
                {activeTab === 'appearance' && (
                  <section id="appearance" className="bg-card/70 p-6 pt-0 rounded-md lg:col-span-2">
                    <div className="mb-3">
                      <h2 className="text-lg font-semibold flex items-center gap-2"><Palette className="w-5 h-5" /> Appearance</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Update your brand assets first, then tune your theme in one place.
                      </p>
                    </div>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground">Brand Assets</h3>

                        <div className="rounded-lg border border-border bg-background/30 p-4">
                          <Label className="text-sm">Shop Logo</Label>
                          <div className="mt-4 flex flex-col items-center gap-4">
                            {form.watch('logo') ? (
                              <div className="relative inline-block">
                                <Image
                                  src={form.watch('logo') ?? ''}
                                  alt="Shop logo"
                                  width={160}
                                  height={160}
                                  className="w-40 h-40 object-cover rounded-2xl border-2 border-border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 w-7 h-7 p-0 rounded-full"
                                  onClick={() => handleImageRemove('logo')}
                                  disabled={isSaving}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="w-40 h-40 bg-muted border-2 border-dashed border-border rounded-2xl flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}

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
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB. Recommended: 200x200px.</p>
                          </div>
                        </div>

                        <div className="rounded-lg border border-border bg-background/30 p-4">
                          <Label className="text-sm">Banner Image</Label>
                          <div className="mt-4 space-y-4">
                            {form.watch('banner') ? (
                              <div className="relative">
                                <Image
                                  src={form.watch('banner') ?? ''}
                                  alt="Shop banner"
                                  width={1400}
                                  height={360}
                                  className="w-full h-44 object-cover rounded-xl border border-border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 w-7 h-7 p-0 rounded-full"
                                  onClick={() => handleImageRemove('banner')}
                                  disabled={isSaving}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="w-full h-44 bg-muted border-2 border-dashed border-border rounded-xl flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}

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
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB. Recommended: 1200x400px.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Theme Customization</h3>
                        <p className="text-xs text-muted-foreground">Use this section for all theme controls.</p>
                        <div className="rounded-lg border border-border bg-background/20 p-4">
                          <ThemeCustomizer
                            lightTheme={lightTheme}
                            darkTheme={darkTheme}
                            hasThemeChanges={hasThemeChanges}
                            resetThemeToDefaults={resetThemeToDefaults}
                            handleThemeColorChange={handleThemeColorChange}
                          />
                        </div>
                      </div>
                    </div>
                   </section>
                )}

                {/* Payments tab */}
                {activeTab === 'payments' && (
                  <section id="payments" className="bg-card/70 p-6 pt-0 rounded-md">
                    <div className="mb-3">
                      <h2 className="text-lg font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payments</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="rounded-lg border border-border bg-background/30 p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-[#635bff] text-white flex items-center justify-center font-semibold">
                            S
                          </div>
                          <h3 className="font-medium text-foreground">Stripe</h3>
                        </div>

                        {shop?.stripe_account_connected ? (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">Stripe is connected.</p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => window.open('https://dashboard.stripe.com', '_blank', 'noopener,noreferrer')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Visit Stripe Dashboard
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">Connect Stripe to receive payments.</p>
                            <Button type="button" onClick={handleConnectStripe} disabled={isStripeActionLoading}>
                              {isStripeActionLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Redirecting...
                                </>
                              ) : (
                                'Connect Stripe'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg border border-border bg-background/30 p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-[#00c3f7] text-white flex items-center justify-center">
                            <Landmark className="w-5 h-5" />
                          </div>
                          <h3 className="font-medium text-foreground">Paystack</h3>
                        </div>

                        {shop?.paystack_account_connected ? (
                          <div className="space-y-3">
                            {isPaystackLoading ? (
                              <p className="text-sm text-muted-foreground">Loading Paystack account details...</p>
                            ) : paystackSubAccount ? (
                              <div className="space-y-1 text-sm">
                                <p><span className="text-muted-foreground">Account Number:</span> {paystackSubAccount.account_number}</p>
                                <p><span className="text-muted-foreground">Settlement Bank:</span> {paystackSubAccount.settlement_bank}</p>
                              </div>
                            ) : (
                              <Button type="button" variant="outline" onClick={fetchPaystackSubAccount}>
                                Refresh Paystack Details
                              </Button>
                            )}

                            <div className="rounded-md border border-border bg-muted/30 p-3">
                              <p className="text-xs text-muted-foreground">Current Balance</p>
                              <p className="text-xl font-semibold text-foreground">
                                {formatCurrency(Number(shop?.paystack_account_balance ?? 0), 'NGN')}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Next payout runs daily by 2:00 AM for balances of at least ₦10,000.
                              </p>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm font-medium text-foreground">Recent Transactions</p>
                              <div className="rounded-md border border-border">
                                {isTransactionsLoading ? (
                                  <p className="text-sm text-muted-foreground p-3">Loading transactions...</p>
                                ) : transactions.length === 0 ? (
                                  <p className="text-sm text-muted-foreground p-3">No Paystack transactions yet.</p>
                                ) : (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Tracking ID</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {transactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                          <TableCell>
                                            {new Date(transaction.created_at).toLocaleString()}
                                          </TableCell>
                                          <TableCell>{transaction.reference_id ?? '-'}</TableCell>
                                          <TableCell>{transaction.tracking_id ?? '-'}</TableCell>
                                          <TableCell className="capitalize">{transaction.type}</TableCell>
                                          <TableCell className="capitalize">{transaction.status}</TableCell>
                                          <TableCell className="text-right">
                                            {formatCurrency(Number(transaction.amount), transaction.currency || 'NGN')}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )}
                              </div>

                              {transactionsTotalPages > 1 && (
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-muted-foreground">{transactionsTotal} transaction(s)</p>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setTransactionsPage((prev) => Math.max(1, prev - 1))}
                                      disabled={transactionsPage === 1 || isTransactionsLoading}
                                    >
                                      Previous
                                    </Button>
                                    <span className="text-xs text-muted-foreground">
                                      Page {transactionsPage} of {transactionsTotalPages}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setTransactionsPage((prev) => Math.min(transactionsTotalPages, prev + 1))
                                      }
                                      disabled={
                                        transactionsPage === transactionsTotalPages || isTransactionsLoading
                                      }
                                    >
                                      Next
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowPaystackUpdateForm((prev) => !prev);
                                if (paystackSubAccount?.account_number) {
                                  paystackForm.setValue('accountNumber', paystackSubAccount.account_number);
                                }
                              }}
                            >
                              {showPaystackUpdateForm ? 'Cancel Update' : 'Update Paystack Account'}
                            </Button>

                            {showPaystackUpdateForm && (
                              <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                  <Label htmlFor="bank-search-update">Search Bank</Label>
                                  <Input
                                    id="bank-search-update"
                                    placeholder="Type bank name or code"
                                    value={bankSearch}
                                    onChange={(e) => setBankSearch(e.target.value)}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Choose Bank</Label>
                                  <div className="max-h-44 overflow-y-auto rounded-md border border-border">
                                    {filteredBanks.length > 0 ? (
                                      filteredBanks.map((bank) => (
                                        <button
                                          key={bank.id}
                                          type="button"
                                          onClick={() => {
                                            paystackForm.setValue('bankCode', bank.code, { shouldValidate: true });
                                            setBankSearch(bank.name);
                                          }}
                                          className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${selectedBankCode === bank.code ? 'bg-muted' : ''}`}
                                        >
                                          <span className="font-medium">{bank.name}</span>
                                        </button>
                                      ))
                                    ) : (
                                      <p className="px-3 py-2 text-sm text-muted-foreground">No banks found.</p>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="accountNumber-update">Account Number</Label>
                                  <Input
                                    id="accountNumber-update"
                                    placeholder="0123456789"
                                    {...paystackForm.register('accountNumber')}
                                  />
                                </div>

                                <Button
                                  type="button"
                                  onClick={paystackForm.handleSubmit(handleUpdatePaystackAccount)}
                                  disabled={isUpdatingPaystackAccount}
                                >
                                  {isUpdatingPaystackAccount ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    'Save Paystack Update'
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : shop?.currency === 'NGN' ? (
                          <div className="space-y-4 max-w-md">
                            <div className="space-y-2">
                              <Label htmlFor="bank-search">Search Bank</Label>
                              <Input
                                id="bank-search"
                                placeholder="Type bank name or code"
                                value={bankSearch}
                                onChange={(e) => setBankSearch(e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Choose Bank</Label>
                              <div className="max-h-44 overflow-y-auto rounded-md border border-border">
                                {filteredBanks.length > 0 ? (
                                  filteredBanks.map((bank) => (
                                    <button
                                      key={bank.id}
                                      type="button"
                                      onClick={() => {
                                        paystackForm.setValue('bankCode', bank.code, { shouldValidate: true });
                                        setBankSearch(bank.name);
                                      }}
                                      className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${selectedBankCode === bank.code ? 'bg-muted' : ''}`}
                                    >
                                      <span className="font-medium">{bank.name}</span>
                                    </button>
                                  ))
                                ) : (
                                  <p className="px-3 py-2 text-sm text-muted-foreground">No banks found.</p>
                                )}
                              </div>
                              {paystackForm.formState.errors.bankCode && (
                                <p className="text-sm text-error">{paystackForm.formState.errors.bankCode.message}</p>
                              )}
                              {selectedBank && (
                                <p className="text-xs text-muted-foreground">Selected: {selectedBank.name}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="accountNumber">Account Number</Label>
                              <Input
                                id="accountNumber"
                                placeholder="0123456789"
                                {...paystackForm.register('accountNumber')}
                              />
                              {paystackForm.formState.errors.accountNumber && (
                                <p className="text-sm text-error">{paystackForm.formState.errors.accountNumber.message}</p>
                              )}
                            </div>

                            <Button
                              type="button"
                              onClick={paystackForm.handleSubmit(handleCreatePaystackAccount)}
                              disabled={isCreatingPaystackAccount}
                            >
                              {isCreatingPaystackAccount ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                'Connect Paystack Account'
                              )}
                            </Button>
                          </div>
                        ) : <></>}
                      </div>
                    </div>
                  </section>
                )}

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
              </div>
             </form>
           </main>
         </div>
       </div>
    </div>
  );
}
