'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  DollarSign,
  Tag,
  Star
} from 'lucide-react';
import { createProductSchema, updateProductSchema } from '@/lib/schema/product';
import { useAppSelector } from '@/hooks/redux.hook';
import axios from 'axios';
import ProductStepForm from '@/components/productForm/ProductStepForm';

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
  weight: number;
  length: number;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
  shop_id: number;
}

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



export default function AdminProductsPage() {
  const { domain } = useParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;



  const categoriesState = useAppSelector(state => state.category.categories);
  const shop = useAppSelector(state => state.shop.shop);
  const categories = categoriesState.filter(cat => cat.parent_id === shop!.category_id);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: productsPerPage.toString(),
      });
      if (searchTerm) queryParams.set('search', searchTerm)
      if (selectedStatus !== 'all') queryParams.set('status', selectedStatus)
      if (selectedCategory !== 'all') queryParams.set('category', selectedCategory)
      if (sortBy) queryParams.set('sortBy', sortBy)
      if (sortOrder) queryParams.set('sortOrder', sortOrder)

      const response = await axios.get(`/api/shops/${domain}/products?${queryParams}`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages || 1);
      setTotalProducts(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to fetch products. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [domain, searchTerm, selectedStatus, selectedCategory, sortBy, sortOrder, currentPage, productsPerPage, router]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setError('');
    setSuccess('');
  };

  const handleCreateProduct = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const validatedData = createProductSchema.parse(formData);
      const response = await axios.post(`/api/shops/${domain}/products`, validatedData);
      
      setProducts(prev => [response.data, ...prev]);
      setSuccess('Product created successfully!');
      resetForm();
      setIsCreateOpen(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create product. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      throw error; // Re-throw to let ProductStepForm handle validation errors
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (formData: ProductFormData) => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    setError('');

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { slug, ...updateData } = formData;
      const validatedData = updateProductSchema.parse(updateData);
      const response = await axios.put(`/api/shops/${domain}/products/${selectedProduct.slug}`, validatedData);
      
      setProducts(prev => prev.map(product => 
        product.id === selectedProduct.id ? response.data : product
      ));
      
      setSuccess('Product updated successfully!');
      resetForm();
      setIsEditOpen(false);
      setSelectedProduct(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to update product. Please try again.');
      } else {
        setError('Failed to update product. Please try again.');
      }
      throw error; // Re-throw to let ProductStepForm handle validation errors
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    setError('');

    try {
      await axios.delete(`/api/shops/${domain}/products/${selectedProduct.slug}`);
      
      setProducts(prev => prev.filter(product => product.id !== selectedProduct.id));
      
      setSuccess('Product deleted successfully!');
      setIsDeleteOpen(false);
      setSelectedProduct(null);
      
      setTimeout(() => setSuccess(''), 3000);
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

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setError('');
    setIsEditOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setError('');
    setIsDeleteOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      out_of_stock: 'bg-red-100 text-red-700'
    };
    
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-700'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Reset pagination when filters change
  useEffect(() => {
    resetPagination();
  }, [searchTerm, selectedStatus, selectedCategory, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
              <Package className="w-8 h-8 text-neutral-700" />
              Products Management
            </h1>
            <p className="text-neutral-600 mt-1">Manage your shop&apos;s product catalog</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your shop catalog
                </DialogDescription>
              </DialogHeader>
              <ProductStepForm 
                onSubmit={handleCreateProduct}
                submitLabel="Create Product"
                isSubmitting={isSubmitting}
                error={error}
                categories={categories}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <Tag className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="stock_quantity">Stock</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={toggleSortOrder} className="px-3">
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-500" />
              <p className="text-neutral-500">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-8 h-8 text-neutral-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-900">
                  No products found
                </h3>
                <p className="text-neutral-500 mt-1">
                  {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first product to get started'
                  }
                </p>
              </div>
              {!searchTerm && selectedStatus === 'all' && selectedCategory === 'all' && (
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Product</DialogTitle>
                      <DialogDescription>
                        Add a new product to your shop catalog
                      </DialogDescription>
                    </DialogHeader>
                    <ProductStepForm 
                      onSubmit={handleCreateProduct}
                      submitLabel="Create Product"
                      isSubmitting={isSubmitting}
                      error={error}
                      categories={categories}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white">
                <CardHeader className="p-0">
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {product.is_featured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(product.status)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {product.description || 'No description available'}
                    </CardDescription>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-neutral-500" />
                        <span className="font-bold text-lg">
                          ${product.discount > 0 
                            ? (product.price * (1 - product.discount / 100)).toFixed(2)
                            : product.price.toFixed(2)
                          }
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-neutral-500 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.discount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {product.discount}% OFF
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-neutral-500">
                      <span>Stock: {product.stock_quantity}</span>
                      <span>{new Date(product.created_at).toLocaleDateString()}</span>
                    </div>

                    {product.category_ids.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.category_ids.slice(0, 2).map(categoryId => {
                          const category = categories.find(c => c.id === categoryId);
                          return category ? (
                            <Badge key={categoryId} variant="outline" className="text-xs">
                              {category.name}
                            </Badge>
                          ) : null;
                        })}
                        {product.category_ids.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.category_ids.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 flex items-center justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/${domain}/products/${product.slug}`} target="_blank" className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      View
                    </a>
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(product)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteModal(product)}
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

        {/* Pagination */}
        {!isLoading && products.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
            <div className="text-sm text-neutral-600">
              Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update your product information
              </DialogDescription>
            </DialogHeader>
            <ProductStepForm 
              onSubmit={handleEditProduct}
              submitLabel="Update Product"
              isSubmitting={isSubmitting}
              initialData={selectedProduct ? {
                name: selectedProduct.name,
                slug: selectedProduct.slug,
                description: selectedProduct.description || '',
                price: selectedProduct.price,
                discount: selectedProduct.discount,
                image: selectedProduct.image,
                thumbnails: selectedProduct.thumbnails,
                stock_quantity: selectedProduct.stock_quantity,
                status: selectedProduct.status,
                is_featured: selectedProduct.is_featured,
                category_ids: selectedProduct.category_ids,
                weight: selectedProduct.weight,
                length: selectedProduct.length,
                width: selectedProduct.width,
                height: selectedProduct.height,
              } : undefined}
              error={error}
              categories={categories}
              isEdit={true}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &ldquo;{selectedProduct?.name}&rdquo;? This action cannot be undone.
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
    </div>
  );
}
