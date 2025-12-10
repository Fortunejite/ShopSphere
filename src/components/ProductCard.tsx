import { ProductAttributes } from "@/models/Product";
import { Eye, ShoppingCart, Star, Heart, StarHalf } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import { getTotalStock, inStock } from "@/lib/product";
import { addToCart, itemInCart, removeFromCart, selectCartStatus } from "@/redux/cartSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux.hook";

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity < 5) return { text: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

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

const ProductCard = ({ product, isListView = false }: { product: ProductAttributes; isListView?: boolean }) => {
  const reduxState = useAppSelector(state => state);
  const cartStatus = useAppSelector(selectCartStatus);
  const dispatch = useAppDispatch();
  const { shop } = reduxState.shop;

  const pricing = formatPrice(product.price, product.discount);
  const stockStatus = getStockStatus(getTotalStock(product));
  const isInCart = itemInCart(reduxState, product.id);

  const handleAddToCart = async () => {
    if (!product || !shop?.domain) return;

    dispatch(addToCart({
      shopDomain: shop.domain,
      item: {
        product_id: product.id,
        quantity: 1,
        variant_index: product.variants.length > 0 ? 0 : undefined,
      }
    }));
  };
    
  const handleRemoveFromCart = async () => {
    if (!product || !shop?.domain) return;
    dispatch(removeFromCart({
      shopDomain: shop.domain,
      product_id: product.id,
      variant_index: product.variants.length > 0 ? 0 : undefined,
    }));
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
            <div className="flex gap-4">
              <div className="relative w-24 h-24 shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                />
                {product.discount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    -{product.discount}%
                  </Badge>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">${pricing.discounted}</span>
                      {product.discount > 0 && (
                        <span className="text-sm text-gray-500 line-through">${pricing.original}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* TODO: ADD Rating system */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* {product.rating && (
                      <div className="flex items-center gap-1">
                        {renderStars(product.rating)}
                        <span className="text-sm text-gray-600">({product.reviews_count || 0})</span>
                      </div>
                    )} */}
                    <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/products/${product.slug}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={toggleCart}
                      disabled={!inStock(product) || cartStatus === 'loading'}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {cartStatus === 'loading'
                        ? 'Adding...'
                        : !inStock(product)
                          ? 'Out of Stock'
                          : isInCart
                            ? 'Remove from Cart'
                            : 'Add to Cart'
                      }
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
            <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-10">{product.name}</h3>
            
            {/* TODO: Add rating system */}
            {/* {product.rating && (
              <div className="flex items-center gap-2">
                {renderStars(product.rating)}
                <span className="text-sm text-gray-600">({product.reviews_count || 0})</span>
              </div>
            )} */}
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-gray-900">${pricing.discounted}</span>
                {product.discount > 0 && (
                  <span className="text-sm text-gray-500 line-through ml-2">${pricing.original}</span>
                )}
              </div>
              <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full"
            onClick={toggleCart}
            disabled={!inStock(product) || cartStatus === 'loading'}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {cartStatus === 'loading'
              ? 'Adding...'
              : !inStock(product)
                ? 'Out of Stock'
                : isInCart
                  ? 'Remove from Cart'
                  : 'Add to Cart'
            }
          </Button>
        </CardFooter>
      </Card>
    );
  };

export default ProductCard;