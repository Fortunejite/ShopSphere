import { CartWithProducts, CartItemWithProduct } from '@/models/Cart';
import { ProductVariant } from '@/models/Product';

const CART_STORAGE_KEY = 'shop_sphere_cart';

// Minimal product data needed for cart display and calculations
interface CartProductData {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount: number;
  image: string;
  stock_quantity: number;
  variants?: ProductVariant[];
}

// Lightweight cart item for localStorage
interface LocalCartItem {
  product_id: number;
  quantity: number;
  variant_index?: number;
  product: CartProductData;
  subtotal: number;
}

// Local storage version with serializable dates and minimal product data
interface LocalCartData {
  id: number;
  user_id: number;
  shop_id: number;
  items: LocalCartItem[];
  total_items: number;
  total_amount: number;
  created_at: string; // ISO string for serialization
  updated_at: string; // ISO string for serialization
}

// Helper to extract minimal product data for storage
function extractCartProductData(product: CartItemWithProduct['product']): CartProductData {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    discount: product.discount || 0,
    image: product.image,
    stock_quantity: product.stock_quantity,
    variants: product.variants,
  };
}

// Helper to convert LocalCartItem to CartItemWithProduct
function convertLocalItemToCartItem(localItem: LocalCartItem): CartItemWithProduct {
  // Create a full ProductAttributes object by filling in the missing fields with defaults
  const fullProduct: CartItemWithProduct['product'] = {
    ...localItem.product,
    shop_id: 0, // We don't need this in cart context
    category_ids: [], // We don't need this in cart context
    description: '', // Not needed for cart display
    thumbnails: [], // Not needed for cart display
    is_featured: false, // Not needed for cart display
    weight: 0, // Not needed for cart display
    length: 0, // Not needed for cart display
    width: 0, // Not needed for cart display
    height: 0, // Not needed for cart display
    status: 'active' as const, // Not needed for cart display
    sales_count: 0, // Not needed for cart display
    variants: localItem.product.variants || [], // Ensure variants is always an array
  };

  return {
    product_id: localItem.product_id,
    quantity: localItem.quantity,
    variant_index: localItem.variant_index,
    product: fullProduct,
    subtotal: localItem.subtotal,
  };
}

// Helper to convert CartItemWithProduct to LocalCartItem
function convertCartItemToLocalItem(cartItem: CartItemWithProduct): LocalCartItem {
  return {
    product_id: cartItem.product_id,
    quantity: cartItem.quantity,
    variant_index: cartItem.variant_index,
    product: extractCartProductData(cartItem.product),
    subtotal: cartItem.subtotal,
  };
}

// Convert LocalCartData to CartWithProducts
function convertToCartWithProducts(localCart: LocalCartData): CartWithProducts {
  return {
    ...localCart,
    items: localCart.items.map(convertLocalItemToCartItem),
    created_at: new Date(localCart.created_at),
    updated_at: new Date(localCart.updated_at),
  };
}

// Convert CartWithProducts to LocalCartData
function convertToLocalCart(cart: Partial<CartWithProducts>): LocalCartData {
  const now = new Date().toISOString();
  return {
    id: cart.id || 0,
    user_id: cart.user_id || 0,
    shop_id: cart.shop_id || 0,
    items: cart.items?.map(convertCartItemToLocalItem) || [],
    total_items: cart.total_items || 0,
    total_amount: cart.total_amount || 0,
    created_at: cart.created_at instanceof Date ? cart.created_at.toISOString() : (cart.created_at as unknown as string) || now,
    updated_at: cart.updated_at instanceof Date ? cart.updated_at.toISOString() : (cart.updated_at as unknown as string) || now,
  };
}

const createDefaultShopCart = (): CartWithProducts => {
  const now = new Date();
  return {
    id: 0,
    user_id: 0,
    shop_id: 0,
    items: [],
    total_items: 0,
    total_amount: 0,
    created_at: now,
    updated_at: now,
  };
};

/**
 * Get cart items for a specific shop from local storage
 */
export function getLocalCart(): CartWithProducts {
  if (typeof window === 'undefined') return createDefaultShopCart();
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return createDefaultShopCart();
    
    const localCart: LocalCartData = JSON.parse(cartData);
    if (!localCart) return createDefaultShopCart();
    
    // Convert from serializable format to CartWithProducts
    return convertToCartWithProducts(localCart);
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return createDefaultShopCart();
  }
}

/**
 * Set cart items for a specific shop in local storage
 */
export function setLocalCart(items: CartItemWithProduct[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (items.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    const existingCart: LocalCartData | null = cartData ? JSON.parse(cartData) : null;
    
    // Calculate totals
    const total_items = items.reduce((sum, item) => sum + item.quantity, 0);
    const total_amount = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Create cart object with proper dates
    const cartToStore: CartWithProducts = {
      id: 0,
      user_id: 0,
      shop_id: 0,
      items,
      total_items,
      total_amount,
      created_at: existingCart ? new Date(existingCart.created_at) : new Date(),
      updated_at: new Date(),
    };
    
    // Convert to serializable format for storage
    const localCartToStore = convertToLocalCart(cartToStore);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCartToStore));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

/**
 * Add item to local storage cart
 */
export function addToLocalCart(item: CartItemWithProduct): CartWithProducts {
  const currentCart = getLocalCart();

  // Find existing item with same product and variant
  const existingItemIndex = currentCart.items.findIndex(
    cartItem => 
      cartItem.product_id === item.product_id && 
      cartItem.variant_index === item.variant_index
  );
  
  if (existingItemIndex >= 0) {
    // Update quantity of existing item
    currentCart.items[existingItemIndex].quantity += item.quantity;
    // Recalculate subtotal with discount
    const product = currentCart.items[existingItemIndex].product;
    const basePrice = product.price;
    const discount = product.discount || 0;
    const finalPrice = basePrice * (1 - discount / 100);
    currentCart.items[existingItemIndex].subtotal = 
      currentCart.items[existingItemIndex].quantity * finalPrice;
  } else {
    // Add new item with proper subtotal calculation
    const product = item.product;
    const basePrice = product.price;
    const discount = product.discount || 0;
    const finalPrice = basePrice * (1 - discount / 100);
    const itemWithCorrectSubtotal = {
      ...item,
      subtotal: item.quantity * finalPrice
    };
    currentCart.items.push(itemWithCorrectSubtotal);
  }
  
  setLocalCart(currentCart.items);
  return getLocalCart(); // Return fresh data
}

/**
 * Update item quantity in local storage cart
 */
export function updateLocalCartQuantity(
  productId: number,
  quantity: number,
  variantIndex?: number
): CartWithProducts {
  const currentCart = getLocalCart();

  const updatedItems = currentCart.items.map(item => {
    if (item.product_id === productId && item.variant_index === variantIndex) {
      const newQuantity = Math.max(0, quantity);
      const basePrice = item.product.price;
      const discount = item.product.discount || 0;
      const finalPrice = basePrice * (1 - discount / 100);
      return { 
        ...item, 
        quantity: newQuantity,
        subtotal: newQuantity * finalPrice
      };
    }
    return item;
  }).filter(item => item.quantity > 0); // Remove items with 0 quantity

  setLocalCart(updatedItems);
  return getLocalCart();
}

/**
 * Remove item from local storage cart
 */
export function removeFromLocalCart(
  productId: number,
  variantIndex?: number
): CartWithProducts {
  const currentCart = getLocalCart();
  const updatedItems = currentCart.items.filter(item =>
    !(item.product_id === productId && item.variant_index === variantIndex)
  );

  setLocalCart(updatedItems);
  return getLocalCart();
}

/**
 * Clear all items from local storage cart for a shop
 */
export function clearLocalCart(): void {
  setLocalCart([]);
}

/**
 * Get total items count for a shop cart
 */
export function getLocalCartCount(): number {
  const { items } = getLocalCart();
  return items.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Clear all carts from local storage (useful on logout)
 */
export function clearAllLocalCarts(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing carts from localStorage:', error);
  }
}

/**
 * Check if there are any items in local storage carts
 */
export function hasLocalCartItems(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return false;

    const localCart: LocalCartData = JSON.parse(cartData);
    return localCart.items && localCart.items.length > 0;
  } catch (error) {
    console.error('Error checking localStorage carts:', error);
    return false;
  }
}
