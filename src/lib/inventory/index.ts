import { onOrderPaid } from "./order";
import { onProductSold, onStockRestore } from "./products";

// Define the event handlers and their expected parameters
export const inventoryEvents = {
  'ORDER_PAID': onOrderPaid,
  'ITEM_SOLD': onProductSold,
  'RESTORE_STOCK': onStockRestore,
} as const;

// Type mapping for event names to their handler parameters
type InventoryEventMap = {
  'ORDER_PAID': Parameters<typeof onOrderPaid>;
  'ITEM_SOLD': Parameters<typeof onProductSold>;
  'RESTORE_STOCK': Parameters<typeof onStockRestore>;
};

// Type-safe event emitter function
export async function emitInventoryEvent<K extends keyof InventoryEventMap>(
  eventName: K,
  ...args: InventoryEventMap[K]
): Promise<void> {
  const eventHandler = inventoryEvents[eventName];
  if (eventHandler) {
    try {
      // @ts-expect-error - TypeScript can't infer the exact parameter types across the function boundary
      await eventHandler(...args);
      console.log(`✅ Inventory event '${eventName}' processed successfully`);
    } catch (error) {
      console.error(`❌ Error processing inventory event '${eventName}':`, error);
      throw error; // Re-throw to allow caller to handle
    }
  } else {
    console.warn(`⚠️  No handler found for inventory event: ${eventName}`);
  }
}

// Export types for external use
export type InventoryEventName = keyof InventoryEventMap;
export type InventoryEventParams<T extends InventoryEventName> = InventoryEventMap[T];

// Re-export types
export * from './types';