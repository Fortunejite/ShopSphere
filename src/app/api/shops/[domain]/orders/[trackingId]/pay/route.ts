import { errorHandler } from "@/lib/errorHandler";
import { NextResponse } from "next/server";
import OrderService from "@/services/order.service";

export const GET = errorHandler(async (request, { params }) => {
  const { domain, trackingId } = await params;
  if (!domain || !trackingId) {
    throw Object.assign(new Error('Shop domain and tracking ID are required'), { status: 400 });
  }
  
  const checkoutUrl = await OrderService.initializePaymentForOrder(domain, trackingId);

  return NextResponse.json({ checkoutUrl });
});