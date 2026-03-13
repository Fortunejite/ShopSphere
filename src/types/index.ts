export interface ShopWithOwner extends ShopAttributes {
  owner_email: string;
  owner_username: string;
  category: string;
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

export interface CartItemWithProduct extends CartItem {
  product: ProductAttributes;
  subtotal: number;
}

export interface CartWithProducts extends Omit<CartAttributes, 'items'> {
  items: CartItemWithProduct[];
  total_items: number;
  total_amount?: number;
}

interface ProductsResponse {
  products: ProductWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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