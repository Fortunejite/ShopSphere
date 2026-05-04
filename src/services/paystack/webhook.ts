import { prisma } from '@/lib/prisma';
import OrderService from '@/services/order.service';
import {
  ChargeSuccessData,
  PaystackSubaccount,
  PaystackWebhookEvent,
  TransferEventData,
} from '@/services/paystack/types';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';
import { increaseAccountBalance } from './shopAccount';

// ─── Signature Verification ───────────────────────────────────────────────────
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!signature) {
    console.warn('Paystack webhook signature missing');
    return false;
  }

  const hash = crypto
    .createHmac('sha512', SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  return hash === signature;
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

async function handleChargeSuccess(data: ChargeSuccessData): Promise<void> {
  // Check if a subaccount was involved
  const subaccount = data.subaccount as PaystackSubaccount;
  if (!subaccount) {
    console.warn('Paystack charge.success missing subaccount', {
      transactionId: data.id,
      trackingId: data.metadata?.trackingId,
    });
    throw {
      message: 'Shop not found',
      status: 404,
    };
  }

  const trackingId = data.metadata?.trackingId;

  if (!trackingId) {
    console.warn('Paystack charge.success missing trackingId', {
      transactionId: data.id,
      subaccountCode: subaccount.subaccount_code,
    });
    throw {
      message: 'TrackingId not found',
      status: 400,
    };
  }

  console.info('Processing Paystack charge.success', {
    transactionId: data.id,
    trackingId,
    subaccountCode: subaccount.subaccount_code,
    businessName: subaccount.business_name,
  });

  console.log(
    `Subaccount: ${subaccount.subaccount_code} (${subaccount.business_name})`,
  );

  const amountOwnedByShop = (data.fees_split?.subaccount || 0) / 100;
  await increaseAccountBalance(subaccount.subaccount_code, {
    amount: amountOwnedByShop,
    currency: data.currency,
    referenceId: data.reference,
    trackingId,
  });
  await OrderService.processPaidOrder(trackingId);
  console.info('Paystack charge.success completed', {
    transactionId: data.id,
    trackingId,
  });
}

async function handleTransferSuccess(data: TransferEventData): Promise<void> {
  console.info('Processing Paystack transfer.success', {
    transferId: data.id,
    transferCode: data.transfer_code,
  });

  await prisma.paystackTransaction.update({
    where: { reference_id: data.reference },
    data: {
      status: 'success',
    },
  });
  console.info('Paystack transfer.success completed', {
    transferId: data.id,
    transferCode: data.transfer_code,
  });
}

async function handleTransferFailed(data: TransferEventData): Promise<void> {
  console.info('Processing Paystack transfer.failed', {
    transferId: data.id,
    transferCode: data.transfer_code,
  });

  const payout = await prisma.paystackTransaction.findUnique({
    where: { reference_id: data.reference },
    include: { shop: true },
  });

  if (!payout) {
    console.error('Payout transaction not found for failed transfer', {
      transferId: data.id,
      reference: data.reference,
    });
    throw {
      message: 'Payout transaction not found',
      status: 404,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.paystackTransaction.update({
      where: { reference_id: data.reference },
      data: {
        status: 'failed',
      },
    });

    await tx.shop.update({
      where: { id: payout.shop.id },
      data: {
        paystack_account_balance: {
          increment: payout.amount,
        },
      },
    });
  });

  console.info('Paystack transfer.failed completed', {
    transferId: data.id,
    transferCode: data.transfer_code,
  });
}

export const paystackWebhookHandler = async (body: PaystackWebhookEvent) => {
  console.info('Handling Paystack webhook event', {
    eventId: body.data.id,
    eventType: body.event,
  });

  // check if event has been processed before
  const existingEvent = await prisma.paystackEvent.findUnique({
    where: { event_id: body.data.id.toString() },
  });
  if (existingEvent) {
    console.log('Paystack event already processed', {
      eventId: body.data.id,
      eventType: body.event,
    });
    return;
  }

  // store the event
  await prisma.paystackEvent.create({
    data: {
      event_id: body.data.id.toString(),
      event_type: body.event,
      payload: body.data as unknown as Prisma.InputJsonValue,
      received_at: new Date(),
    },
  });

  console.info('Paystack event stored', {
    eventId: body.data.id,
    eventType: body.event,
  });

  switch (body.event) {
    case 'charge.success':
      return handleChargeSuccess(body.data as ChargeSuccessData);
    case 'transfer.success':
      return handleTransferSuccess(body.data as TransferEventData);
    case 'transfer.failed':
    case 'transfer.reversed':
      return handleTransferFailed(body.data as TransferEventData);
    default:
      console.warn('Unhandled Paystack event type', {
        eventId: body.data.id,
        eventType: body.event,
      });
  }
};
