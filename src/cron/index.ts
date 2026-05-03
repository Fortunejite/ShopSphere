import cron from 'node-cron';
import { runDailyPayoutsCron } from "@/services/paystack/payout";

cron.schedule(' 0 2 * * *', async () => {
  await runDailyPayoutsCron();
});
