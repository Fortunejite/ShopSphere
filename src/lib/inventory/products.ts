import ProductService from "@/services/product.service";

export const onProductSold = async (productId: number, quantity: number): Promise<void> => {
  await ProductService.updateProductById(productId, {
    stock_quantity: { decrement: quantity },
    sales_count: { increment: quantity },
  });
};

// Restore stock (for order cancellations, returns, etc.)
export const onStockRestore = async (productId: number, quantity: number): Promise<void> => {
  await ProductService.updateProductById(productId, {
    stock_quantity: { increment: quantity },
  });
};
