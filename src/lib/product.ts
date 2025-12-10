import { ProductAttributes } from "@/models/Product";

export const inStock = (product: ProductAttributes) => (
  product.stock_quantity > 0 || product.variants.some(variant => variant.stock_quantity > 0)
)

export const getTotalStock = (product: ProductAttributes) => {
  if (product.variants.length === 0) {
    return product.stock_quantity;
  }
  return product.variants.reduce((total, variant) => total + variant.stock_quantity, 0);
}

export const getVariaintStock = (product: ProductAttributes, variantIndex: number) => {
  if (product.variants.length === 0) {
    return product.stock_quantity;
  }
  const variant = product.variants[variantIndex];
  return variant ? variant.stock_quantity : 0;
}