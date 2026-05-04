import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { MINIMUM_PAYOUT_AMOUNT } from './constants';
import { Shop } from '@prisma/client';

interface TransferPayload {
  amount: number; // in kobo
  subaccount: string;
  reference: string;
}

const paystackHeaders = {
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
};

const generateUniqueReference = (shopId: Shop['id']): string => {
  const today = new Date().toISOString().split('T')[0];
  return `payout_${shopId}_${today}`;
};

const getPaystackBalance = async () => {
  const { data } = await axios.get('https://api.paystack.co/balance', {
    headers: paystackHeaders,
  });
  return data[0].balance as number;
};

const initiateTransfer = async (payload: TransferPayload) => {
  const res = await axios.post(
    'https://api.paystack.co/transfer',
    {
      source: 'balance',
      reason: `Payout to subaccount ${payload.subaccount}`,
      amount: payload.amount,
      recipient: payload.subaccount,
      reference: payload.reference,
    },
    { headers: paystackHeaders },
  );

  if (!res.data || !res.data.status) {
    throw new Error('Failed to initiate transfer with Paystack');
  }

  return {
    transferCode: res.data.data.transfer_code,
    status: res.data.data.status,
  };
};

export const runDailyPayoutsCron = async () => {
  console.log('Running daily payouts cron job...');

  const shops = await prisma.shop.findMany({
    where: {
      paystack_account_id: {
        not: null,
      },
      paystack_account_balance: {
        gte: MINIMUM_PAYOUT_AMOUNT,
      },
      status: 'active',
    },
  });

  if (shops.length === 0) {
    console.log('No shops eligible for payout today.');
    return;
  }

  // Note shop.paystack_account_balance is in NGN

  console.log(`Found ${shops.length} shops eligible for payout.`);
  const paystackBalance = (await getPaystackBalance()) / 100; // Convert from kobo to NGN
  console.log(`Current Paystack balance: ${paystackBalance} NGN`);
  const totalRequired = shops.reduce(
    (sum, shop) => sum + shop.paystack_account_balance.toNumber(),
    0,
  );
  console.log(`Total required for payouts: ${totalRequired} NGN`);

  if (paystackBalance < totalRequired) {
    console.error('Insufficient Paystack balance to cover all payouts.');
    console.error(`Need additional ${totalRequired - paystackBalance} NGN`);
    return;
  }
  for (const shop of shops) {
    const reference = generateUniqueReference(shop.id);
    try {
      const existingTransfer = await prisma.paystackTransaction.findUnique({
        where: { reference_id: reference },
      });
      if (existingTransfer) {
        console.log(
          `Transfer already initiated for shop ${shop.id} with reference ${reference}`,
        );
        continue;
      }

      await prisma.$transaction(async (tx) => {
        await tx.paystackTransaction.create({
          data: {
            reference_id: reference,
            amount: shop.paystack_account_balance.toNumber(),
            currency: 'NGN',
            type: 'debit',
            status: 'pending',

            shop: {
              connect: { paystack_account_id: shop.paystack_account_id! },
            },
          },
        });
        await tx.shop.update({
          where: { id: shop.id },
          data: {
            paystack_account_balance: 0,
          },
        });
      });

      const { transferCode, status } = await initiateTransfer({
        amount: shop.paystack_account_balance
          .mul(100)
          .toDecimalPlaces(0)
          .toNumber(), // Convert to kobo
        subaccount: shop.paystack_account_id!,
        reference,
      });

      console.log(
        `Successfully initiated transfer for shop ${shop.id}. Transfer code: ${transferCode}, status: ${status}`,
      );
    } catch (error) {
      console.error(
        `Failed to initiate transfer for shop ${shop.id}. Error:`,
        error,
      );
    }
  }
  console.log('Daily payouts cron job completed.');
};
