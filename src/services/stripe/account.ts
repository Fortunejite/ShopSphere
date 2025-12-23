import { ShopAttributes } from "@/models/Shop";
import { stripe } from ".";

export const createAccount = async (shopData: ShopAttributes, email: string) => {
  const account = await stripe.v2.core.accounts.create({
    display_name: shopData.name,
    contact_email: email,
    dashboard: "full",
    defaults: {
      responsibilities: {
        fees_collector: "stripe",
        losses_collector: "stripe",
      },
    },
    identity: {
      country: "US",
      entity_type: "company",
    },
    configuration: {
      customer: {},
      merchant: {
        capabilities: {
          card_payments: { requested: true },
        },
      },
    },
  });

  return account;
}

export const createAccountLink = async (accountId: string, domain: string) => {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const url = `${protocol}://${domain}.${rootDomain}/admin`;

  const accountLink = await stripe.v2.core.accountLinks.create({
    account: accountId,
    use_case: {
      type: 'account_onboarding',
      account_onboarding: {
        configurations: ['merchant', 'customer'],
        refresh_url: url,
        return_url: url,
      },
    },
  });

  return accountLink.url;
}