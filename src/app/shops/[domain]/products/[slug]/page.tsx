'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Star,
  StarHalf,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  AlertCircle,
  Package,
  // MessageCircle,
  // User,
  // Verified
} from 'lucide-react';
import axios from 'axios';
import { ProductLoading } from '@/components/Loading';
import { cn } from '@/lib/utils';
import { ProductAttributes } from '@/models/Product';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import { formatPrice } from '@/lib/currency';
import { 
  itemInCart, 
  addToCart, 
  updateCartItem,
  selectCartStatus,
  removeFromCart,
  getCartItemQuantity,
} from '@/redux/cartSlice';

// TODO: Implement Reviews

export default function ProductDetailsPage() {
  const { domain, slug } = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const reduxState = useAppSelector(state => state);
  const cartStatus = useAppSelector(selectCartStatus);

  const [product, setProduct] = useState<ProductAttributes | null>(null);
  // const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { shop } = useAppSelector(state => state.shop);
    const categoriesState = useAppSelector(state => state.category.categories);
    const categories = categoriesState.filter(cat => cat.parent_id === shop!.category_id);
  
  // Product interaction states
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductAttributes['variants'][0] | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Sync quantity with cart when product, variant, or cart state changes
  useEffect(() => {
    if (!product || !shop?.domain) return;
    
    const currentVariantIndex = selectedVariant ? product.variants.indexOf(selectedVariant) : undefined;
    const currentIsInCart = itemInCart(reduxState, product.id, currentVariantIndex);
    
    if (currentIsInCart) {
      const cartQuantity = getCartItemQuantity(reduxState, product.id, currentVariantIndex);
      setQuantity(cartQuantity);
    } else {
      setQuantity(1); // Reset to 1 when not in cart
    }
  }, [product, selectedVariant, reduxState.cart, shop?.domain, reduxState]);

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
      
      // Set default variant if available
      if (productData.variants && productData.variants.length > 0) {
        const defaultVariant = productData.variants.find((v: ProductAttributes['variants'][0]) => v.is_default) || productData.variants[0];
        setSelectedVariant(defaultVariant);
        setSelectedAttributes(defaultVariant.attributes);
      }
      
      // Fetch reviews (mock data for now)
      // setReviews([
      //   {
      //     id: 1,
      //     user_name: 'John D.',
      //     rating: 5,
      //     comment: 'Excellent product! Great quality and fast shipping.',
      //     created_at: '2024-11-15T10:30:00Z',
      //     verified_purchase: true
      //   },
      //   {
      //     id: 2,
      //     user_name: 'Sarah M.',
      //     rating: 4,
      //     comment: 'Good value for money. Would recommend.',
      //     created_at: '2024-11-10T14:20:00Z',
      //     verified_purchase: true
      //   }
      // ]);
      
    } catch (error) {
      console.error('Error fetching product details:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setError('Product not found');
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

  const getCurrentPrice = () => formatPrice(product?.price || 0, product?.discount || 0, shop!.currency);

  const getCurrentStock = () => product?.stock_quantity || 0;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderStars = (rating: number = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        )}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  const handleAttributeChange = (attributeKey: string, value: string) => {
    const isCurrentlySelected = selectedAttributes[attributeKey] === value;
    
    let newAttributes: Record<string, string>;
    
    if (isCurrentlySelected) {
      // Unselect the attribute
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [attributeKey]: _, ...remainingAttributes } = selectedAttributes;
      newAttributes = remainingAttributes;
    } else {
      // Only proceed if this is a valid selection
      if (!isAttributeValueAvailable(attributeKey, value)) return;
      // Select the new value
      newAttributes = { ...selectedAttributes, [attributeKey]: value };
    }
    
    setSelectedAttributes(newAttributes);
    
    // Find matching variant with the new selection
    if (product?.variants) {
      const matchingVariant = product.variants.find(variant => {
        return Object.entries(newAttributes).every(([key, val]) => 
          variant.attributes[key] === val
        );
      });
      
      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
        // Quantity will be automatically synced via useEffect
      } else {
        // Clear variant if no exact match (partial selection)
        setSelectedVariant(null);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!product || !shop?.domain) return;
    
    // Check if item is already in cart
    const variantIndex = selectedVariant !== null ? product.variants.indexOf(selectedVariant) : undefined;

    // Calculate price with discount
    const basePrice = product.price;
    const discount = product.discount || 0;
    const finalPrice = basePrice * (1 - discount / 100);

    dispatch(addToCart({
      shopDomain: shop.domain,
      item: {
        product_id: product.id,
        quantity,
        variant_index: typeof variantIndex === 'number' ? variantIndex : undefined,
        product,
        subtotal: finalPrice * quantity,
      }
    }));
  };

  const handleRemoveFromCart = async () => {
    if (!product || !shop?.domain) return;
    const variantIndex = selectedVariant !== null ? product.variants.indexOf(selectedVariant) : undefined;
    dispatch(removeFromCart({
      shopDomain: shop.domain,
      product_id: product.id,
      variant_index: typeof variantIndex === 'number' ? variantIndex : undefined,
    }));
  };

  const getProductCategories = () => {
    return categories.filter(cat => product?.category_ids.includes(cat.id));
  };

  const getAllPossibleAttributes = () => {
    if (!product?.variants || product.variants.length === 0) return {};
    
    // Get all possible attribute keys and values
    const allAttributes: Record<string, Set<string>> = {};
    
    product.variants.forEach(variant => {
      Object.entries(variant.attributes).forEach(([key, value]) => {
        if (!allAttributes[key]) {
          allAttributes[key] = new Set();
        }
        allAttributes[key].add(value);
      });
    });
    
    // Convert to arrays
    const result: Record<string, string[]> = {};
    Object.entries(allAttributes).forEach(([key, valueSet]) => {
      result[key] = Array.from(valueSet);
    });
    
    return result;
  };

  const getAvailableAttributes = () => {
    if (!product?.variants || product.variants.length === 0) return {};
    
    // Get all possible attributes first
    const allPossibleAttributes = getAllPossibleAttributes();
    
    // If no attributes are selected, return all possible attributes
    if (Object.keys(selectedAttributes).length === 0) {
      return allPossibleAttributes;
    }
    
    // For each attribute key, find which values are compatible with current selection
    const availableAttributes: Record<string, string[]> = {};
    
    Object.keys(allPossibleAttributes).forEach(attributeKey => {
      // If this attribute is currently selected, include its selected value
      if (selectedAttributes[attributeKey]) {
        availableAttributes[attributeKey] = [selectedAttributes[attributeKey]];
      } else {
        // Find compatible values for this attribute
        const compatibleValues: Set<string> = new Set();
        
        // Test each possible value
        allPossibleAttributes[attributeKey].forEach(value => {
          // Create test selection including this value
          const testSelection = { ...selectedAttributes, [attributeKey]: value };
          
          // Check if any variant matches this combination
          const hasMatchingVariant = product.variants.some(variant => {
            return Object.entries(testSelection).every(([key, val]) => 
              variant.attributes[key] === val
            );
          });
          
          if (hasMatchingVariant) {
            compatibleValues.add(value);
          }
        });
        
        availableAttributes[attributeKey] = Array.from(compatibleValues);
      }
    });
    
    return availableAttributes;
  };

  const isAttributeValueAvailable = (attributeKey: string, value: string) => {
    if (!product?.variants) return false;
    
    // If this attribute is already selected with this value, it's available (for deselection)
    if (selectedAttributes[attributeKey] === value) return true;
    
    // Create test attributes excluding the current attribute, then adding this value
    // This ensures we test compatibility with other selected attributes
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [attributeKey]: _, ...otherSelectedAttributes } = selectedAttributes;
    const testAttributes = { ...otherSelectedAttributes, [attributeKey]: value };
    
    // Check if any variant matches this combination
    return product.variants.some(variant => {
      return Object.entries(testAttributes).every(([key, val]) => 
        variant.attributes[key] === val
      );
    });
  };

  const isValidCompleteSelection = () => {
    if (!product?.variants || product.variants.length === 0) return true;
    
    // Get all required attribute keys
    const requiredKeys = new Set<string>();
    product.variants.forEach(variant => {
      Object.keys(variant.attributes).forEach(key => requiredKeys.add(key));
    });
    
    // Check if all required attributes are selected
    for (const key of requiredKeys) {
      if (!selectedAttributes[key]) return false;
    }
    
    // Check if current selection matches a variant
    return selectedVariant !== null;
  };

  if (isLoading) {
    return <ProductLoading text="Loading product details..." fullPage />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
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
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Product not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const pricing = getCurrentPrice();
  const currentStock = getCurrentStock();
  const productCategories = getProductCategories();
  const availableAttributes = getAvailableAttributes();
  const variantIndex = selectedVariant ? product.variants.indexOf(selectedVariant) : undefined;
  const isInCart = itemInCart(reduxState, product.id, variantIndex);

  const toggleCart = () => {
    if (isInCart) {
      handleRemoveFromCart();
    } else {
      handleAddToCart();
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (isInCart && shop?.domain) {
      // Update quantity in cart if item is already in cart
      dispatch(updateCartItem({
        shopDomain: shop.domain,
        product_id: product.id,
        quantity: newQuantity,
        variant_index: variantIndex,
      }));
    }
    // Always update local quantity state
    setQuantity(newQuantity);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href='/' className="hover:text-gray-900">
              Home
            </Link>
            <span>/</span>
            <Link href='/products' className="hover:text-gray-900">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  -{product.discount}% OFF
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {(product.thumbnails.length > 0 || product.image) && (
              <div className="grid grid-cols-5 gap-2">
                {/* Main Image Thumbnail */}
                {product.image && (
                  <div 
                    className={cn(
                      'relative aspect-square bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-colors',
                      selectedImage === product.image ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => setSelectedImage(product.image)}
                  >
                    <Image
                      src={product.image}
                      alt="Main image"
                      fill
                      className="object-cover"
                      onError={() => {
                        console.error('Failed to load main product image');
                      }}
                    />
                    <div className="absolute bottom-1 left-1">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        Main
                      </Badge>
                    </div>
                  </div>
                )}
                
                {/* Additional Thumbnails */}
                {product.thumbnails.filter(Boolean).map((thumbnail, index) => (
                  <div 
                    key={`thumb-${index}`}
                    className={cn(
                      'relative aspect-square bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-colors',
                      selectedImage === thumbnail ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => setSelectedImage(thumbnail)}
                  >
                    <Image
                      src={thumbnail}
                      alt={`Additional view ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={() => {
                        console.error(`Failed to load thumbnail ${index + 1}`);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {/* Rating */}
              {/* <div className="flex items-center gap-4 mb-4">
                {product.rating && (
                  <div className="flex items-center gap-2">
                    {renderStars(product.rating)}
                    <span className="text-lg font-medium">{product.rating}</span>
                    <span className="text-gray-600">({product.reviews_count || 0} reviews)</span>
                  </div>
                )}
                <div className="text-gray-600">
                  {product.sales_count} sold
                </div>
              </div> */}

              {/* Categories */}
              {productCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {productCategories.map(category => (
                    <Badge key={category.id} variant="secondary">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="border-b pb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-gray-900">{pricing.discounted}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">{pricing.original}</span>
                    <Badge className="bg-red-100 text-red-800">
                      Save {pricing.savings}
                    </Badge>
                  </>
                )}
              </div>
              
              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className={cn(
                  'font-medium',
                  currentStock > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
                </span>
                {currentStock > 0 && currentStock < 10 && (
                  <Badge variant="outline" className="text-orange-600">
                    Only {currentStock} left!
                  </Badge>
                )}
              </div>
            </div>

            {/* Variants */}
            {Object.keys(getAllPossibleAttributes()).length > 0 && (
              <div className="space-y-4">
                {/* Selection Status */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-800">
                    {Object.keys(selectedAttributes).length === 0 ? (
                      "Please select product options below:"
                    ) : Object.keys(selectedAttributes).length === Object.keys(getAllPossibleAttributes()).length ? (
                      <div className="flex items-center gap-2">
                        <span className="text-green-700 font-medium">✓ All options selected</span>
                        {selectedVariant && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Variant available
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span>
                        Selection progress: {Object.keys(selectedAttributes).length} of {Object.keys(getAllPossibleAttributes()).length} options selected
                      </span>
                    )}
                  </div>
                  {Object.keys(selectedAttributes).length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      💡 Click a selected option to deselect it, or select different values to see available combinations
                    </div>
                  )}
                </div>
                {Object.entries(getAllPossibleAttributes()).map(([attributeKey, allValues]) => (
                  <div key={attributeKey}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {attributeKey.replace('_', ' ')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allValues.map(value => {
                        const isSelected = selectedAttributes[attributeKey] === value;
                        const isAvailable = isAttributeValueAvailable(attributeKey, value);
                        
                        return (
                          <Button
                            key={value}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAttributeChange(attributeKey, value)}
                            disabled={!isAvailable && !isSelected}
                            className={cn(
                              "capitalize transition-all",
                              !isAvailable && !isSelected && "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 hover:bg-gray-100",
                              isSelected && "ring-2 ring-blue-200"
                            )}
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || !isValidCompleteSelection() || (cartStatus === 'loading' && isInCart)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock || !isValidCompleteSelection() || (cartStatus === 'loading' && isInCart)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {isValidCompleteSelection() && currentStock > 0 && (
                  <span className="text-sm text-gray-500">
                    ({currentStock} available)
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={toggleCart}
                  disabled={currentStock === 0 || cartStatus === 'loading' || !isValidCompleteSelection()}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {cartStatus === 'loading'
                    ? 'Adding...'
                    : currentStock === 0
                      ? 'Out of Stock'
                      : !isValidCompleteSelection() && Object.keys(availableAttributes).length > 0
                        ? 'Please Select All Options'
                        : isInCart
                          ? 'Remove from Cart'
                          : 'Add to Cart'
                  }
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setIsInWishlist(!isInWishlist)}
                >
                  <Heart className={cn('w-5 h-5', isInWishlist && 'fill-red-500 text-red-500')} />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="w-5 h-5" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-5 h-5" />
                <span>Secure payment & buyer protection</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RotateCcw className="w-5 h-5" />
                <span>30-day return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              {/* <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger> */}
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {product.description ? (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">{product.description}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No description available for this product.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Weight:</span>
                        <span>{product.weight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Dimensions:</span>
                        <span>{product.length} × {product.width} × {product.height} cm</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Availability:</span>
                        <span className={currentStock > 0 ? 'text-green-600' : 'text-red-600'}>
                          {currentStock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Category:</span>
                        <span>{productCategories.map(c => c.name).join(', ') || 'Uncategorized'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Added:</span>
                        <span>{new Date(product.created_at!).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Standard Shipping</h4>
                      <p className="text-sm text-gray-600 mb-1">5-7 business days</p>
                      <p className="text-sm font-medium">Free on orders over $50</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Express Shipping</h4>
                      <p className="text-sm text-gray-600 mb-1">2-3 business days</p>
                      <p className="text-sm font-medium">$9.99</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Package Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Weight: {product.weight} kg</p>
                      <p>Dimensions: {product.length} × {product.width} × {product.height} cm</p>
                      <p>This product ships from our warehouse within 1-2 business days.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map(review => (
                        <div key={review.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{review.user_name}</h4>
                                  {review.verified_purchase && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Verified className="w-3 h-3 mr-1" />
                                      Verified Purchase
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {renderStars(review.rating)}
                                  <span className="text-sm text-gray-600">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No reviews yet</p>
                      <p className="text-sm">Be the first to review this product!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
