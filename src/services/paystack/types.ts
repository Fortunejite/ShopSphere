export interface PaystackCustomer {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  customer_code: string;
  phone: string | null;
  metadata: Record<string, unknown> | null;
}

export interface PaystackSubaccount {
  id: number;
  subaccount_code: string;
  business_name: string;
  description: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  metadata: Record<string, unknown> | null;
  percentage_charge: number;
  settlement_bank: string;
  account_number: string;
  active: boolean;
  migrate: boolean;
  is_verified: boolean;
}

export interface PaystackAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
}

export interface FeesSplit {
  paystack: number;
  integration: number;
  subaccount: number;
  params: {
    bearer: string;
    transaction_charge: string;
    percentage_charge: string;
  };
}

// charge.success
export interface ChargeSuccessData {
  id: number;
  domain: 'live' | 'test';
  status: 'success';
  reference: string;
  amount: number; // in kobo
  message: string | null;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: 'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer';
  currency: string;
  ip_address: string | null;
  metadata: Record<string, string> | null;
  fees: number;
  fees_split: FeesSplit | null;
  customer: PaystackCustomer;
  authorization: PaystackAuthorization;
  subaccount: PaystackSubaccount | Record<string, never>; // empty {} if no split
  split: Record<string, unknown>;
  order_id: string | null;
  paidAt: string;
  requested_amount: number;
  source: Record<string, unknown> | null;
}

// subaccount.created / subaccount.updated (same shape)
export interface SubaccountEventData {
  id: number;
  subaccount_code: string;
  business_name: string;
  description: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  metadata: Record<string, number> | null;
  percentage_charge: number;
  is_verified: boolean;
  settlement_bank: string;
  account_number: string;
  settlement_schedule: 'auto' | 'weekly' | 'monthly' | 'manual';
  active: boolean;
  migrate: boolean;
  integration: number;
  domain: 'live' | 'test';
  createdAt: string;
  updatedAt: string;
}

// transfer.success / transfer.failed / transfer.reversed
export interface TransferEventData {
  amount: number;
  currency: string;
  domain: 'live' | 'test';
  failures: null | string;
  id: number;
  integration: Record<string, unknown>;
  reason: string;
  reference: string;
  source: string;
  source_details: null;
  status: 'success' | 'failed' | 'reversed';
  titan_code: null;
  transfer_code: string;
  request: number;
  transferred_at: string | null;
  recipient: {
    active: boolean;
    currency: string;
    description: string;
    domain: string;
    email: string | null;
    id: number;
    integration: number;
    metadata: null;
    name: string;
    recipient_code: string;
    type: string;
    is_deleted: boolean;
    details: {
      account_number: string;
      account_name: string | null;
      bank_code: string;
      bank_name: string;
    };
  };
  session: { provider: null; id: null };
  createdAt: string;
  updatedAt: string;
}

// Union of all webhook event payloads
export type PaystackWebhookEvent =
  | { event: 'charge.success'; data: ChargeSuccessData }
  | { event: 'subaccount.created'; data: SubaccountEventData }
  | { event: 'subaccount.updated'; data: SubaccountEventData }
  | { event: 'transfer.success'; data: TransferEventData }
  | { event: 'transfer.failed'; data: TransferEventData }
  | { event: 'transfer.reversed'; data: TransferEventData };