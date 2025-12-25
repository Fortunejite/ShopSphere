'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux.hook';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package,
  Search,
  Grid3X3,
  List,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { ProductLoading, CardLoading } from '@/components/Loading';
import { cn } from '@/lib/utils';
import { ProductAttributes } from '@/models/Product';
import ProductCard from '@/components/ProductCard';

export default function ShopHomePage() {
  const { shop } = useAppSelector((s) => s.shop);
  const categoriesState = useAppSelector(state => state.category.categories);
  const categories = categoriesState.filter(cat => cat.parent_id === shop?.category_id);
  
  const [products, setProducts] = useState<ProductAttributes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and display states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  useEffect(() => {
    if (shop) {
      // Reset pagination when filters change
      setCurrentPage(1);
      fetchProducts(1);
    }
  }, [shop, searchTerm, selectedCategory, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: productsPerPage.toString(),
        status: 'active',
      });
      
      if (searchTerm) queryParams.set('search', searchTerm);
      if (selectedCategory !== 'all') {
        const category = categories.find(c => c.id.toString() === selectedCategory);
        if (category) {
          queryParams.set('category', category.name);
        } else {
          queryParams.set('category', selectedCategory);
        }
      }
      if (sortBy) {
        const sortMapping: Record<string, { field: string; order: string }> = {
          'featured': { field: 'is_featured', order: 'desc' },
          'price_low': { field: 'price', order: 'asc' },
          'price_high': { field: 'price', order: 'desc' },
          'newest': { field: 'created_at', order: 'desc' },
          'popular': { field: 'sales_count', order: 'desc' },
          'rating': { field: 'created_at', order: 'desc' },
        };
        
        const mapping = sortMapping[sortBy];
        if (mapping) {
          queryParams.set('sortBy', mapping.field);
          queryParams.set('sortOrder', mapping.order);
        }
      }

      const { data: productsRes } = await axios.get(`/api/shops/${shop?.domain}/products?${queryParams}`);
      
      const newProducts = productsRes.products || [];
      const total = productsRes.pagination.total || 0;
      const totalPages = productsRes.pagination.totalPages || 1;

      setProducts(newProducts);
      setTotalProducts(total);
      setTotalPages(totalPages);
      setCurrentPage(page);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!shop) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        {shop.banner ? (
          // Hero with banner image
          <div className="relative h-[300px] md:h-[400px] overflow-hidden">
            <Image
              src={shop.banner}
              alt={`${shop.name} banner`}
              fill
              className="object-cover"
              priority
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                  Welcome to {shop.name}
                </h1>
                
                <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                  - {shop.tagline} -
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Hero without banner image (original layout)
          <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
                Welcome to {shop.name}
              </h1>
              
              <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                - {shop.tagline} -
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-3">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
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
              
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Mode */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== 'all') && (
            <div className="flex justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Products Grid/List */}
        {isLoading ? (
          <div className="space-y-6">
            <ProductLoading text="Loading products..." size="lg" className="justify-center" />
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            )}>
              {Array.from({ length: 8 }).map((_, i) => (
                <CardLoading key={i} />
              ))}
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'This shop doesn\'t have any products yet'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}>
            {products.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ 
                  animationDelay: `${(index % productsPerPage) * 30}ms`,
                  animationFillMode: 'both'
                }}
              >
                <ProductCard product={product} isListView={viewMode === 'list'} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && products.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* Page info */}
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
            </div>
            
            {/* Pagination controls */}
            <div className="flex items-center space-x-2">
              {/* Previous button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchProducts(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <Button
                      variant={1 === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchProducts(1)}
                      disabled={isLoading}
                      className="w-10 h-8"
                    >
                      1
                    </Button>
                    {currentPage > 4 && <span className="text-gray-400">...</span>}
                  </>
                )}

                {/* Current page and neighbors */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  if (pageNumber < 1 || pageNumber > totalPages) return null;
                  if (currentPage > 3 && pageNumber === 1) return null;
                  if (currentPage < totalPages - 2 && pageNumber === totalPages) return null;

                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchProducts(pageNumber)}
                      disabled={isLoading}
                      className="w-10 h-8"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="text-gray-400">...</span>}
                    <Button
                      variant={totalPages === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchProducts(totalPages)}
                      disabled={isLoading}
                      className="w-10 h-8"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              {/* Next button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchProducts(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                className="flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
