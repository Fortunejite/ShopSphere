import Shop from "@/models/Shop.model";
import dbConnect from "./mongodb";
import { ShopWithOwner } from "@/types/shop";

export const getShopBySubdomain = async (subdomain: string) => {
  await dbConnect();
  const shop = await Shop.findOne({ subdomain }).populate('ownerId');
  if (!shop) {
    throw Object.assign(new Error('Shop not found'), { status: 404 });
  }
  return shop as ShopWithOwner;
}

export const getShopById = async (shopId: string) => {
  await dbConnect();
  const shop = await Shop.findById(shopId).populate('ownerId');
  if (!shop) {
    throw Object.assign(new Error('Shop not found'), { status: 404 });
  }
  return shop as ShopWithOwner;
}