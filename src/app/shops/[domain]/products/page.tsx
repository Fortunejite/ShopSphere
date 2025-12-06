'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Grid3X3,
  List,
  Package,
  AlertCircle,
  ChevronUp
} from 'lucide-react';
import axios from 'axios';
import { ProductLoading, CardLoading } from '@/components/Loading';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/hooks/redux.hook';
import { ProductAttributes } from '@/models/Product';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const { domain } = useParams();
  const searchParams = useSearchParams();

  const { shop } = useAppSelector(state => state.shop);
  const categoriesState = useAppSelector(state => state.category.categories);
  const categories = categoriesState.filter(cat => cat.parent_id === shop!.category_id);
  
  const [products, setProducts] = useState<ProductAttributes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and display states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Infinite scroll pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadMoreError, setLoadMoreError] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const productsPerPage = 12;
  
  // Intersection Observer ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset products and pagination when filters change
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchProducts(true);
  }, [domain, searchTerm, selectedCategory, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more products function
  const loadMoreProducts = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchProducts(false);
    }
  }, [isLoadingMore, hasMore]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoading && !isLoadingMore && !error) {
          // Add a small delay to prevent too many rapid requests
          setTimeout(() => {
            if (hasMore && !isLoadingMore) {
              loadMoreProducts();
            }
          }, 100);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '200px' // Start loading 200px before the element comes into view
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef && 'IntersectionObserver' in window) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef && 'IntersectionObserver' in window) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, error]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError('');
      
      const page = reset ? 1 : currentPage;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: productsPerPage.toString(),
        status: 'active', // Only show active products to users
      });
      
      if (searchTerm) queryParams.set('search', searchTerm);
      if (selectedCategory !== 'all') {
        // Find category name by ID to send to API
        const category = categories.find(c => c.id.toString() === selectedCategory);
        if (category) {
          queryParams.set('category', category.name);
        } else {
          // Fallback: send the selectedCategory as-is (might be name or slug)
          queryParams.set('category', selectedCategory);
        }
      }
      if (sortBy) {
        // Map frontend sort values to API values
        const sortMapping: Record<string, { field: string; order: string }> = {
          'featured': { field: 'is_featured', order: 'desc' },
          'price_low': { field: 'price', order: 'asc' },
          'price_high': { field: 'price', order: 'desc' },
          'newest': { field: 'created_at', order: 'desc' },
          'popular': { field: 'sales_count', order: 'desc' },
          'rating': { field: 'created_at', order: 'desc' }, // Fallback since we don't have ratings yet
        };
        
        const mapping = sortMapping[sortBy];
        if (mapping) {
          queryParams.set('sortBy', mapping.field);
          queryParams.set('sortOrder', mapping.order);
        }
      }

      const { data: productsRes } = await axios.get(`/api/shops/${domain}/products?${queryParams}`);
      
      const newProducts = productsRes.products || [];
      const total = productsRes.pagination.total || 0;
      const totalPages = productsRes.pagination.totalPages || 1;

      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setTotalProducts(total);
      setHasMore(page < totalPages);
      
      if (!reset) {
        setCurrentPage(prev => prev + 1);
      }
      
    } catch (error) {
      console.error('Error fetching products:', error);
      if (reset) {
        setError('Failed to load products. Please try again.');
      } else {
        setLoadMoreError('Failed to load more products. Please try again.');
        // Auto-retry after a delay
        setTimeout(() => {
          setLoadMoreError('');
        }, 3000);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          
          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {isLoading ? 'Loading...' : `${totalProducts} product${totalProducts !== 1 ? 's' : ''} found`}
            </span>
            {(searchTerm || selectedCategory !== 'all') && (
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
            )}
          </div>
        </div>

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
                : 'This shop doesn&apos;t have any products yet'
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
                key={`${product.id}-${index}`} // Include index for better key uniqueness during filter changes
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ 
                  animationDelay: `${(index % productsPerPage) * 30}ms`, // Reduced delay for faster loading feel
                  animationFillMode: 'both'
                }}
              >
                <ProductCard product={product} isListView={viewMode === 'list'} />
              </div>
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger and Load More */}
        {!isLoading && products.length > 0 && (
          <div className="mt-8 space-y-6" role="region" aria-label="Load more products">
            {/* Manual Load More Button */}
            {hasMore && !isLoadingMore && (
              <div className="text-center">
                {loadMoreError ? (
                  <div className="space-y-3">
                    <Alert variant="destructive" className="max-w-md mx-auto">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{loadMoreError}</AlertDescription>
                    </Alert>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setLoadMoreError('');
                        loadMoreProducts();
                      }}
                      size="lg"
                    >
                      Retry Loading Products
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Button
                      variant="outline"
                      onClick={loadMoreProducts}
                      disabled={isLoadingMore}
                      size="lg"
                      aria-label={`Load more products. Currently showing ${products.length} of ${totalProducts} products`}
                    >
                      Load More Products
                    </Button>
                    <div className="text-xs text-gray-400 mt-2">
                      Showing {products.length} of {totalProducts} products
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Automatic Loading Trigger */}
            <div ref={loadMoreRef} className="h-4">
              {isLoadingMore && (
                <div className="text-center py-4">
                  <ProductLoading text="Loading more products..." size="md" className="justify-center" />
                </div>
              )}
            </div>
            
            {/* End of Products Message */}
            {!hasMore && products.length > 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 text-sm">
                  <Package className="w-5 h-5 mx-auto mb-2" />
                  You&apos;ve reached the end of our products!
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {totalProducts} product{totalProducts !== 1 ? 's' : ''} total
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              size="sm"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Progress Indicator */}
        {totalProducts > productsPerPage && products.length > 0 && (
          <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ 
                width: `${Math.min(100, (products.length / totalProducts) * 100)}%` 
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
