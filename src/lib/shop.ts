import { Shop } from "@/models/Shop";

export const getShopByDomain = async (domain: string) => {
  const shop = await Shop.findByDomain(domain);
  if (!shop) {
    throw Object.assign(new Error('Shop not found'), { status: 404 });
  }
  return shop;
}

export const getShopById = async (shopId: number) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw Object.assign(new Error('Shop not found'), { status: 404 });
  }
  return shop;
}