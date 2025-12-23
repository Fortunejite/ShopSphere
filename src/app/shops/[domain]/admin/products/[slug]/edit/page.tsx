'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Package,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { updateProductSchema } from '@/lib/schema/product';
import axios from 'axios';
import ProductStepForm from '@/components/productForm/ProductStepForm';
import { ProductLoading } from '@/components/Loading';
import { ProductAttributes } from '@/models/Product';

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  image: string;
  thumbnails: string[];
  stock_quantity: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  is_featured: boolean;
  category_ids: number[];
  weight: number;
  length: number;
  width: number;
  height: number;
}

export default function EditProductPage() {
  const { domain, slug } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<ProductAttributes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/shops/${domain}/products/${slug}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setError('Product not found.');
          } else if (error.response?.status === 401) {
            router.push('/login');
          } else {
            setError('Failed to fetch product. Please try again.');
          }
        } else {
          setError('Failed to fetch product. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (domain && slug) {
      fetchProduct();
    }
  }, [domain, slug, router]);

  const handleUpdateProduct = async (formData: ProductFormData) => {
    if (!product) return;

    setIsSubmitting(true);
    setError('');

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { slug: formSlug, ...updateData } = formData;
      const validatedData = updateProductSchema.parse(updateData);
      await axios.put(`/api/shops/${domain}/products/${product.slug}`, validatedData);
      
      setSuccess('Product updated successfully! Redirecting...');
      
      // Redirect to products page after a short delay
      setTimeout(() => {
        router.push(`/admin/products`);
      }, 1500);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to update product. Please try again.');
      } else {
        setError('Failed to update product. Please try again.');
      }
      setIsSubmitting(false);
      throw error; // Re-throw to let ProductStepForm handle validation errors
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="py-12">
            <ProductLoading text="Loading product..." size="lg" className="justify-center" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/products`} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Products
              </Link>
            </Button>
          </div>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Error Loading Product</h2>
                  <p className="text-neutral-600 mt-1">{error}</p>
                </div>
                <Button asChild>
                  <Link href={`/admin/products`}>
                    Back to Products
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Product Updated Successfully!</h2>
                <p className="text-neutral-600 mt-1">You will be redirected shortly...</p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/products`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
          </Button>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center justify-center gap-2">
            <Package className="w-8 h-8 text-neutral-700" />
            Edit Product
          </h1>
          <p className="text-neutral-600">Update your product information</p>
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl">Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            {product && (
              <ProductStepForm 
                onSubmit={handleUpdateProduct}
                submitLabel="Update Product"
                isSubmitting={isSubmitting}
                initialData={{
                  name: product.name,
                  slug: product.slug,
                  description: product.description || '',
                  price: product.price,
                  discount: product.discount,
                  image: product.image,
                  thumbnails: product.thumbnails,
                  stock_quantity: product.stock_quantity,
                  status: product.status,
                  is_featured: product.is_featured,
                  category_ids: product.category_ids,
                  weight: product.weight,
                  length: product.length,
                  width: product.width,
                  height: product.height,
                }}
                error={error}
                isEdit={true}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
