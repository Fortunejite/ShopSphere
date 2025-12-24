import { errorHandler } from '@/lib/errorHandler';
import { Order } from '@/models/Order';
import { Shop } from '@/models/Shop';
import { StripeEvent } from '@/models/StripeEvents';
import { stripe } from '@/services/stripe';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const permittedEvents = [
  "checkout.session.completed",
  "account.updated",
]

export const POST = errorHandler(async (req) => {
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      await req.text(),
      req.headers.get('stripe-signature') || '',
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (error) {
    console.error('Error constructing Stripe event:', error);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  // check if event has been processed before
  const existingEvent = await StripeEvent.findById(event.id);
  if (existingEvent) {
    console.log('Event already processed:', event.id);
    return NextResponse.json({ received: true });
  }

  // store the event
  await StripeEvent.create({
    event_id: event.id,
    event_type: event.type,
    payload: event.data.object,
    received_at: new Date(),
  });

  if (!permittedEvents.includes(event.type)) {
    console.warn('Unhandled event type:', event.type);
    return NextResponse.json({ error: 'Unhandled event type' }, { status: 400 });
  }

  let data;

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      data = event.data.object as Stripe.Checkout.Session;

      if (!data.metadata?.trackingId) {
        throw new Error('Tracking ID not found in metadata');
      }
      // const lineItems = expandedSession.line_items.data as Stripe.LineItem[];
      const order = await Order.findByTrackingId(data.metadata.trackingId);
      if (!order) {
        throw new Error('Order not found for tracking ID: ' + data.metadata.trackingId);
      }

      await Order.updatePaymentStatus(order.id, 'paid');
      break;

    case "account.updated":
      data = event.data.object as Stripe.Account;
      if (data.details_submitted) {
        const shop = await Shop.findByStripeAccountId(data.id);
        if (!shop) {
          return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
        }
        await Shop.update(shop.id, { stripe_account_connected: data.details_submitted });
      }
      break;
    default:
      console.warn('Unhandled event type:', event.type);
      return NextResponse.json({ error: 'Unhandled event type' }, { status: 400 });
  }

  return NextResponse.json({ received: true });
})