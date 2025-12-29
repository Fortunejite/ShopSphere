'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Package,
  DollarSign,
  BarChart3,
  Calendar,
  Star,
  TrendingUp,
  Truck,
  Tag,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ImageIcon,
  Loader2
} from 'lucide-react';
import axios from 'axios';

import { useAppSelector } from '@/hooks/redux.hook';
import { PageLoading } from '@/components/Loading';
import { formatCurrency, formatPrice } from '@/lib/currency';

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discount: number;
  image: string;
  thumbnails: string[];
  stock_quantity: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  is_featured: boolean;
  category_ids: number[];
  category_names?: string[];
  variants?: ProductVariant[];
  weight: number;
  length: number;
  width: number;
  height: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
  shop_id: number;
  shop_name?: string;
  shop_domain?: string;
}

interface ProductVariant {
  attributes: Record<string, string>;
  is_default: boolean;
}

export default function ProductDetailsPage() {
  const { domain, slug } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  
  // Edit and Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const categoriesState = useAppSelector(state => state.category.categories);
  const shop = useAppSelector(state => state.shop.shop);
  const categories = categoriesState.filter(cat => cat.parent_id === shop!.category_id);

  useEffect(() => {
    fetchProductDetails();
  }, [domain, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProductDetails = async () => {
    try {
      setIsLoading(true);
      setError('');

      const productRes = await axios.get(`/api/shops/${domain}/products/${slug}`);

      const productData = productRes.data;
      setProduct(productData);
      setSelectedImage(productData.image);
      
    } catch (error) {
      console.error('Error fetching product details:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setError('Product not found');
        } else if (error.response?.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to load product details');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-3 h-3" />;
      case 'inactive': return <XCircle className="w-3 h-3" />;
      case 'out_of_stock': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getProductCategories = () => {
    return categories.filter(cat => product?.category_ids.includes(cat.id));
  };



  const handleDeleteProduct = async () => {
    if (!product) return;

    setIsSubmitting(true);
    setError('');

    try {
      await axios.delete(`/api/shops/${domain}/products/${product.slug}`);
      
      setSuccess('Product deleted successfully!');
      setIsDeleteOpen(false);
      
      // Redirect to products list after successful deletion
      setTimeout(() => {
        router.push(`/admin/products`);
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting product:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to delete product. Please try again.');
      } else {
        setError('Failed to delete product. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  const openDeleteModal = () => {
    setError('');
    setIsDeleteOpen(true);
  };

  if (isLoading) {
    return <PageLoading text="Loading product details..." variant="shop" />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Product not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const pricing = formatPrice(product.price, product.discount, shop!.currency);
  const productCategories = getProductCategories();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-4 sm:gap-y-0">
        <div className="flex flex-col xs:flex-row xs:items-center xs:space-x-4 space-y-2 xs:space-y-0">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            size="sm"
            className="w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Back to Products</span>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 line-clamp-2">{product.name}</h1>
            <p className="text-xs sm:text-sm text-gray-500">Product Details</p>
          </div>
        </div>
        
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full xs:w-auto">
          <Link 
            href={`/products/${product.slug}`}
          >
            <Button variant="outline" size="sm" className="w-full xs:w-auto">
              <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>View Live</span>
            </Button>
          </Link>
          <Button variant="outline" size="sm" asChild className="w-full xs:w-auto">
            <Link href={`/admin/products/${product.slug}/edit`}>
              <Edit className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Edit</span>
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={openDeleteModal} className="w-full xs:w-auto">
            <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      {/* Status and Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center mt-1">
                  <Badge className={`${getStatusColor(product.status)} flex items-center gap-1`}>
                    {getStatusIcon(product.status)}
                    {product.status.replace('_', ' ')}
                  </Badge>
                  {product.is_featured && (
                    <Badge variant="secondary" className="ml-2">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Price</p>
                <div className="flex items-center mt-1">
                  {product.discount > 0 ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">{pricing.discounted}</span>
                      <span className="text-sm text-gray-500 line-through">{pricing.original}</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold">{pricing.original}</span>
                  )}
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock</p>
                <div className="flex items-center mt-1">
                  <span className="text-lg font-bold">{product.stock_quantity}</span>
                  <span className="text-sm text-gray-500 ml-1">units</span>
                </div>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sales</p>
                <div className="flex items-center mt-1">
                  <span className="text-lg font-bold">{product.sales_count}</span>
                  <span className="text-sm text-gray-500 ml-1">sold</span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Images */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {product.thumbnails.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  <div 
                    className={`relative aspect-square bg-gray-100 rounded cursor-pointer border-2 ${selectedImage === product.image ? 'border-blue-500' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(product.image)}
                  >
                    <Image
                      src={product.image}
                      alt="Main"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  {product.thumbnails.map((thumbnail, index) => (
                    <div 
                      key={index}
                      className={`relative aspect-square bg-gray-100 rounded cursor-pointer border-2 ${selectedImage === thumbnail ? 'border-blue-500' : 'border-transparent'}`}
                      onClick={() => setSelectedImage(thumbnail)}
                    >
                      <Image
                        src={thumbnail}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Information */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Product Name</label>
                    <p className="text-lg">{product.name}</p>
                  </div>
                  
                  {product.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-800 mt-1">{product.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600">Categories</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {productCategories.length > 0 ? (
                        productCategories.map(category => (
                          <Badge key={category.id} variant="secondary">
                            <Tag className="w-3 h-3 mr-1" />
                            {category.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">No categories assigned</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Created</label>
                      <p className="flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Updated</label>
                      <p className="flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(product.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Sales Count</label>
                      <p className="flex items-center mt-1">
                        <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                        {product.sales_count} sold
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Base Price</label>
                        <p className="text-2xl font-bold">{pricing.original}</p>
                      </div>
                      {product.discount > 0 && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Discount</label>
                            <p className="text-lg text-orange-600">{product.discount}% off</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Sale Price</label>
                            <p className="text-2xl font-bold text-green-600">{pricing.discounted}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Savings</label>
                            <p className="text-lg text-green-600">Save {pricing.savings}</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Stock Quantity</label>
                        <p className="text-2xl font-bold">{product.stock_quantity}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    {product.variants?.length ? 
                      `${product.variants.length} variant${product.variants.length > 1 ? 's' : ''} configured` :
                      'No variants configured for this product'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {product.variants && product.variants.length > 0 ? (
                    <div className="space-y-4">
                      {product.variants.map((variant, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Variant {index + 1}</h4>
                            {variant.is_default && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Attributes</label>
                              <div className="space-y-1 mt-1">
                                {Object.entries(variant.attributes).map(([key, value]) => (
                                  <div key={key} className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {key}: {value}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No variants configured</p>
                      <p className="text-sm">This product uses base pricing and inventory</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Weight</label>
                      <p className="text-lg">{product.weight} kg</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dimensions</label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div>
                          <span className="text-xs text-gray-500">Length</span>
                          <p className="font-medium">{product.length} cm</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Width</span>
                          <p className="font-medium">{product.width} cm</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Height</span>
                          <p className="font-medium">{product.height} cm</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Shipping Notes</h4>
                    <p className="text-sm text-blue-800">
                      These dimensions and weight are used for calculating shipping costs. 
                      Make sure they are accurate for the best customer experience.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Product Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{product.sales_count}</div>
                      <div className="text-sm text-blue-800">Total Sales</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          product.sales_count * (product.discount > 0 
                            ? product.price * (1 - product.discount / 100) 
                            : product.price
                          ), 
                          shop!.currency
                        )}
                      </div>
                      <div className="text-sm text-green-800">Total Revenue</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{product.stock_quantity}</div>
                      <div className="text-sm text-purple-800">Available Stock</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Performance Insights</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Product created {new Date(product.created_at).toLocaleDateString()}</p>
                      <p>• Last updated {new Date(product.updated_at).toLocaleDateString()}</p>
                      <p>• Average sales per day: {(product.sales_count / Math.max(1, Math.ceil((new Date().getTime() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(2)}</p>
                      {product.is_featured && <p>• This is a featured product</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{product?.name}&rdquo;? This action cannot be undone.
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
              onClick={handleDeleteProduct}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
