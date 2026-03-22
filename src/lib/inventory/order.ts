import { OrderItem } from "@/types";
import { emitInventoryEvent } from ".";
import OrderService from "@/services/order.service";

export const onOrderPaid = async (orderId: number) => {
  const order = await OrderService.getOrderById(orderId);

  // Update inventory for each product in the order
  for (const item of order.items as unknown as OrderItem[]) {
    await emitInventoryEvent('ITEM_SOLD', item.product_id, item.quantity);
  }
};
