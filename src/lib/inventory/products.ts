import { database } from "../db";

export const onProductSold = async (productId: number, quantity: number): Promise<void> => {
  await database.query(
    `UPDATE products
    SET
      stock_quantity = stock_quantity - $2,
      sales_count = sales_count + $2,
      updated_at = NOW()
    WHERE id = $1`,
    [productId, quantity]
  );
};

// Restore stock (for order cancellations, returns, etc.)
export const onStockRestore = async (productId: number, quantity: number): Promise<void> => {
  await database.query(
    `UPDATE products
    SET
      stock_quantity = stock_quantity + $2,
      updated_at = NOW()
    WHERE id = $1`,
    [productId, quantity]
  );
};
