import { prisma } from '@/lib/prisma';
import { PaystackTransactionType } from '@prisma/client';

export const increaseAccountBalance = async (
  accountId: string,
  data: {
    amount: number;
    referenceId: string;
    currency: string;
    trackingId: string;
  },
) => {
  await prisma.$transaction(async (tx) => {
    await tx.shop.update({
      where: { paystack_account_id: accountId },
      data: {
        paystack_account_balance: {
          increment: data.amount,
        },
      },
    });

    await tx.paystackTransaction.create({
      data: {
        account_id: accountId,
        reference_id: data.referenceId,
        amount: data.amount,
        currency: data.currency,
        type: PaystackTransactionType.credit,
        tracking_id: data.trackingId,
      },
    });
  });
};
