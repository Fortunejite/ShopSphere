import { paystack } from '.';
import { authorizeUser } from '../user.service';
import ShopService from '../shop.service';
import { Shop } from '@prisma/client';

export interface SettlementItem {
  id: number;
  settlement_date: string;
  total_amount: number;   // in kobo — will be divided by 100 on display
  total_processed: number;
  total_fees: number;
  status: string;
  subaccount_code: string;
  business_name: string;
}

export interface SettlementsMeta {
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export interface SettlementsResult {
  settlements: SettlementItem[];
  meta: SettlementsMeta;
  subaccount_code: string;
  account_number: string;
  settlement_bank: string;
}

/**
 * Fetch paginated Paystack settlements for a shop's sub-account.
 * Uses GET /settlement?subaccount=SUB_CODE&perPage=…&page=…
 */
export const getShopSettlements = async (
  domain: Shop['domain'],
  page: number,
  perPage: number,
): Promise<SettlementsResult> => {
  const user = await authorizeUser();
  const shop = await ShopService.getShopByDomain(domain);

  if (shop.owner_id !== user.id) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }

  if (!shop.paystack_account_connected || !shop.paystack_account_id) {
    return {
      settlements: [],
      meta: { total: 0, page, perPage, pageCount: 1 },
      subaccount_code: '',
      account_number: '',
      settlement_bank: '',
    };
  }

  const subaccount_code = shop.paystack_account_id;

  // Fetch the sub-account details so we can show the bank / account number
  const subAccountRes = await paystack.subAccount.fetch(subaccount_code);
  const subAccountData = subAccountRes.data ?? null;

  // Fetch settlements filtered to this sub-account
  const res = await paystack.settlement.list({
    subaccount: subaccount_code,
    perPage,
    page,
  });

  if (!res.status) {
    throw Object.assign(new Error(res.message ?? 'Failed to fetch settlements'), {
      status: 502,
    });
  }

  const data = (res as { status: boolean; message: string; data: unknown[]; meta: SettlementsMeta }).data ?? [];
  const meta = (res as { status: boolean; message: string; data: unknown[]; meta: SettlementsMeta }).meta ?? {
    total: 0,
    page,
    perPage,
    pageCount: 1,
  };

  const settlements: SettlementItem[] = (data as Array<{
    id: number;
    settlement_date: string | Date;
    total_amount: number;
    total_processed: number;
    total_fees: number;
    status: string;
    subaccount?: { subaccount_code?: string; business_name?: string };
  }>).map((s) => ({
    id: s.id,
    settlement_date: typeof s.settlement_date === 'string'
      ? s.settlement_date
      : s.settlement_date?.toISOString?.() ?? '',
    total_amount: s.total_amount ?? 0,
    total_processed: s.total_processed ?? 0,
    total_fees: s.total_fees ?? 0,
    status: s.status ?? 'pending',
    subaccount_code: s.subaccount?.subaccount_code ?? subaccount_code,
    business_name: s.subaccount?.business_name ?? shop.name,
  }));

  return {
    settlements,
    meta: {
      total: meta.total ?? 0,
      page: meta.page ?? page,
      perPage: meta.perPage ?? perPage,
      pageCount: meta.pageCount ?? 1,
    },
    subaccount_code,
    account_number: subAccountData?.account_number ?? '',
    settlement_bank: subAccountData?.settlement_bank ?? '',
  };
};
