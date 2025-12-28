import { ProductAttributes } from '@/models/Product';
import { Eye, ShoppingCart, Star, Heart, StarHalf, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';
import {
  addToCart,
  itemInCart,
  removeFromCart,
} from '@/redux/cartSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const getStockStatus = (quantity: number) => {
  if (quantity === 0)
    return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
  if (quantity < 5)
    return { text: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
  return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const renderStars = (rating: number = 0) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array(fullStars)
        .fill(0)
        .map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      {hasHalfStar && (
        <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      )}
      {Array(emptyStars)
        .fill(0)
        .map((_, i) => (
          <Star key={i} className="w-4 h-4 text-gray-300" />
        ))}
    </div>
  );
};

const ProductCard = ({
  product,
  isListView = false,
}: {
  product: ProductAttributes;
  isListView?: boolean;
}) => {
  const router = useRouter();
  const reduxState = useAppSelector((state) => state);
  const dispatch = useAppDispatch();
  const { shop } = reduxState.shop;
  
  // Individual loading state for this product card
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'add' | 'remove' | null>(null);

  const pricing = formatPrice(product.price, product.discount);
  const stockStatus = getStockStatus(product.stock_quantity);
  const isInCart = itemInCart(reduxState, product.id);

  const handleAddToCart = async () => {
    if (!product || !shop?.domain) return;

    setIsLoading(true);
    setLoadingAction('add');
    try {
      const result = dispatch(
        addToCart({
          shopDomain: shop.domain,
          item: {
            product_id: product.id,
            quantity: 1,
            variant_index: product.variants.length > 0 ? 0 : undefined,
            product,
            subtotal: product.price,
          },
        }),
      );
      
      // Check if it's a thunk action and wait for it
      if ('unwrap' in result) {
        await result.unwrap();
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!product || !shop?.domain) return;
    
    setIsLoading(true);
    setLoadingAction('remove');
    try {
      const result = dispatch(
        removeFromCart({
          shopDomain: shop.domain,
          product_id: product.id,
        }),
      );
      
      // Check if it's a thunk action and wait for it
      if ('unwrap' in result) {
        await result.unwrap();
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const toggleCart = () => {
    if (isInCart) {
      handleRemoveFromCart();
    } else {
      handleAddToCart();
    }
  };

  if (isListView) {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full h-48 sm:w-24 sm:h-24 shrink-0">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
              {product.discount > 0 && (
                <Badge className="absolute top-2 left-2 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs">
                  -{product.discount}%
                </Badge>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              {/* Title and Price */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1 hidden sm:block">
                      {product.description}
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      {pricing.discounted}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        {pricing.original}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description on mobile */}
              {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2 sm:hidden">
                  {product.description}
                </p>
              )}

              {/* Stock Status and Actions */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* {product.rating && (
                      <div className="flex items-center gap-1">
                        {renderStars(product.rating)}
                        <span className="text-sm text-gray-600">({product.reviews_count || 0})</span>
                      </div>
                    )} */}
                  <Badge className={stockStatus.color}>
                    {stockStatus.text}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 xs:flex-none">
                    <Link href={`/products/${product.slug}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="xs:inline">View</span>
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={
                      product.variants.length > 0
                        ? () => router.push(`/products/${product.slug}`)
                        : toggleCart
                    }
                    disabled={product.stock_quantity === 0 || isLoading}
                    className="flex-1 xs:flex-none"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin flex-shrink-0" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-1 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {product.stock_quantity === 0 
                        ? 'Out of Stock'
                        : product.variants.length > 0
                        ? 'Select Options'
                        : isLoading
                        ? loadingAction === 'add' ? 'Adding...' : 'Removing...'
                        : isInCart
                        ? 'Remove'
                      : 'Add to Cart'}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {product.discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            -{product.discount}%
          </Badge>
        )}
        {product.is_featured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/products/${product.slug}`}>
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="secondary" size="sm">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-10">
            {product.name}
          </h3>

          {/* TODO: Add rating system */}
          {/* {product.rating && (
              <div className="flex items-center gap-2">
                {renderStars(product.rating)}
                <span className="text-sm text-gray-600">({product.reviews_count || 0})</span>
              </div>
            )} */}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">
                {pricing.discounted}
              </span>
              {product.discount > 0 && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  {pricing.original}
                </span>
              )}
            </div>
            <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={
            product.variants.length > 0
              ? () => router.push(`/products/${product.slug}`)
              : toggleCart
          }
          disabled={product.stock_quantity === 0 || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4 mr-2" />
          )}
          {product.variants.length > 0
            ? 'Select Options'
            : isLoading
            ? loadingAction === 'add' ? 'Adding...' : 'Removing...'
            : product.stock_quantity === 0
            ? 'Out of Stock'
            : isInCart
            ? 'Remove from Cart'
            : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
