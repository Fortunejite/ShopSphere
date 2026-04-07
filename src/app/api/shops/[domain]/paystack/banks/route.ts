import { errorHandler } from '@/lib/errorHandler';
import { getAvailableBanks } from '@/services/paystack/account';
import { NextResponse } from 'next/server';

export const GET = errorHandler(async () => {

  const banks = await getAvailableBanks();
  return NextResponse.json({ banks });
});
