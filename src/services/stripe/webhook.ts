import Stripe from 'stripe';
import { stripe } from '.';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import OrderService from '../order.service';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

export const verifyStripeSignature = async (
  body: string,
  signature: string,
): Promise<Stripe.Event> => {
  try {
    return await stripe.webhooks.constructEventAsync(
      body,
      signature,
      WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error('Error constructing Stripe event:', error);
    throw { error: 'Invalid webhook signature', status: 401 };
  }
};

const handleAccountUpdated = async (account: Stripe.Account) => {
  if (account.details_submitted) {
    const shop = await prisma.shop.findUnique({
      where: { stripe_account_id: account.id },
    });
    if (!shop) {
      throw { error: 'Shop not found', status: 404 };
    }
    await prisma.shop.update({
      where: { id: shop.id },
      data: { stripe_account_connected: account.details_submitted },
    });
  }
};

const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  if (!session.metadata?.trackingId) {
    throw new Error('Tracking ID not found in metadata');
  }
  await OrderService.processPaidOrder(session.metadata.trackingId);
};

export const stripeWebhookHandler = async (event: Stripe.Event) => {
  // check if event has been processed before
  const existingEvent = await prisma.stripeEvent.findUnique({
    where: { event_id: event.id },
  });
  if (existingEvent) {
    console.log('Event already processed:', event.id);
    return;
  }

  // store the event
  await prisma.stripeEvent.create({
    data: {
      event_id: event.id,
      event_type: event.type,
      payload: event.data.object as unknown as Prisma.InputJsonValue,
      received_at: new Date(),
    },
  });

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'account.updated':
      await handleAccountUpdated(event.data.object as Stripe.Account);
      break;
    default:
      console.warn('Unhandled event type:', event.type);
      throw { error: 'Unhandled event type', status: 200 };
  }
};
