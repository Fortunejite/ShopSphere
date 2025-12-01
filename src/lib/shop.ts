import { Shop } from "@/models/Shop";

export const getShopBySubdomain = async (subdomain: string) => {
  const shop = await Shop.findByDomain(subdomain);
  if (!shop) {
    throw Object.assign(new Error('Shop not found'), { status: 404 });
  }
  return shop;
}

export const getShopById = async (shopId: string) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw Object.assign(new Error('Shop not found'), { status: 404 });
  }
  return shop;
}