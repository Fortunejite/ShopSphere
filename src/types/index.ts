import { colorTheme } from "@/lib/customTheme";
import { Cart, Category, Product, Shop, User } from "@prisma/client";

export interface ShopWithOwner extends Omit<Shop, 'dark_theme' | 'light_theme'> {
  owner: User;
  category: Category;
  light_theme: colorTheme;
  dark_theme: colorTheme;
}

export interface ProductVariant {
  attributes: Record<string, string>;
  is_default: boolean;
}

export interface CartItem {
  product_id: number;
  quantity: number;
  variant_index?: number;
}

export interface OrderItem extends CartItem {
  unit_price_at_purchase: number;
  discount_at_purchase: number;
  subtotal: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Omit<Product, 'variants'> & { variants : ProductVariant[] };
  subtotal: number;
}

export interface CartWithProducts extends Omit<Cart, 'items'> {
  items: CartItemWithProduct[];
  total_items: number;
  total_amount?: number;
}

export interface AddressInfo {
  name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}