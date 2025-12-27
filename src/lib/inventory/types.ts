// Types for inventory system
export interface OrderItemData {
  product_id: number;
  quantity: number;
  variant_index?: number;
}

export interface LowStockAlert {
  product_id: number;
  current_stock: number;
  threshold: number;
}

// Event result types
export interface InventoryEventResult {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}
