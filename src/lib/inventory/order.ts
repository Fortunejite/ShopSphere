import { Order } from "@/models/Order";
import { emitInventoryEvent } from ".";

export const onOrderPaid = async (orderId: number) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Update inventory for each product in the order
  for (const item of order.items) {
    await emitInventoryEvent('ITEM_SOLD', item.product_id, item.quantity);
  }
};
