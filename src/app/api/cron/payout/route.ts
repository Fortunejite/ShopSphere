import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/errorHandler';
import { runDailyPayoutsCron } from '@/services/paystack/payout';

export const GET = errorHandler(async (request) => {
  const secret = request.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await runDailyPayoutsCron();

  return NextResponse.json({ success: true });
});
