'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Package,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { createProductSchema } from '@/lib/schema/product';
import axios from 'axios';
import ProductStepForm from '@/components/productForm/ProductStepForm';

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

export default function NewProductPage() {
  const { domain } = useParams();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateProduct = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const validatedData = createProductSchema.parse(formData);
      await axios.post(`/api/shops/${domain}/products`, validatedData);
      
      setSuccess('Product created successfully! Redirecting...');
      
      // Redirect to products page after a short delay
      setTimeout(() => {
        router.push(`/admin/products`);
      }, 1500);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create product. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsSubmitting(false);
      throw error; // Re-throw to let ProductStepForm handle validation errors
    }
  };

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
                <h2 className="text-xl font-semibold text-neutral-900">Product Created Successfully!</h2>
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
            Create New Product
          </h1>
          <p className="text-neutral-600">Add a new product to your shop catalog</p>
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
            <ProductStepForm 
              onSubmit={handleCreateProduct}
              submitLabel="Create Product"
              isSubmitting={isSubmitting}
              error={error}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
