import { authorizeUser } from './user.service';
import { createShopSchema } from '@/lib/schema/shop';
import { Shop } from '@prisma/client';
import { createStripeAccount } from './stripe/account';
import z from 'zod';
import {
  create,
  findByDomain,
  findById,
  findByOwnerId,
  remove,
  update,
} from '@/repositories/shop.repository';

class ShopService {
  static async getCurrentUserShops() {
    const user = await authorizeUser();
    const shops = await findByOwnerId(user.id);
    return shops;
  }

  static async getShopById(id: number) {
    const shop = await findById(id);
    if (!shop) {
      throw { message: 'Shop not found', status: 404 };
    }
    return shop;
  }

  static async getShopByDomain(domain: string) {
    const shop = await findByDomain(domain);
    if (!shop) {
      throw { message: 'Shop not found', status: 404 };
    }
    return shop;
  }

  static async isDomainAvailable(domain: string) {
    // Validate domain format (basic validation)
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;
    if (!domainRegex.test(domain)) {
      throw {
        available: false,
        message:
          'Invalid domain format. Domain must contain only letters, numbers, and hyphens.',
        status: 200,
      };
    }

    // Check minimum length
    if (domain.length < 3) {
      throw {
        available: false,
        message: 'Domain must be at least 3 characters long.',
        status: 200,
      };
    }

    // Check maximum length
    if (domain.length > 63) {
      throw {
        available: false,
        message: 'Domain must be less than 63 characters long.',
        status: 200,
      };
    }

    const shop = await findByDomain(domain);
    return !!shop;
  }

  static async createShop(data: z.infer<typeof createShopSchema>) {
    const user = await authorizeUser();
    const { category_id, ...shopData } = createShopSchema.parse(data) as Omit<
      Shop,
      'light_theme' | 'dark_theme'
    > & {
      light_theme?: Shop['light_theme'];
      dark_theme?: Shop['dark_theme'];
    };

    const account = await createStripeAccount(shopData.name, user.email);
    if (!account) {
      throw { message: 'Failed to create Stripe account', status: 500 };
    }

    const shop = await create({
      ...shopData,
      light_theme: shopData.light_theme || {},
      dark_theme: shopData.dark_theme || {},
      stripe_account_id: account.id,

      // Connect relations
      owner: { connect: { id: user.id } },
      category: { connect: { id: category_id } },
    });
    return shop;
  }

  static async updateShop(
    domain: string,
    data: z.infer<typeof createShopSchema>,
  ) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(domain);

    if (shop.owner_id !== user.id) {
      throw { message: 'Unauthorized', status: 403 };
    }

    const { category_id, ...validatedData } = createShopSchema.parse(data) as Omit<
      Shop,
      'light_theme' | 'dark_theme'
    > & {
      light_theme?: Shop['light_theme'];
      dark_theme?: Shop['dark_theme'];
    };

    const updatedShop = await update(shop.id, {
      ...validatedData,
      light_theme: validatedData.light_theme || {},
      dark_theme: validatedData.dark_theme || {},

      // Connect relations
      owner: { connect: { id: user.id } },
      category: { connect: { id: category_id } },
    });

    return updatedShop;
  }

  static async deleteShop(domain: string) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(domain);

    if (shop.owner_id !== user.id) {
      throw { message: 'Unauthorized', status: 403 };
    }

    await remove(shop.id);
    return { message: 'Shop deleted successfully' };
  }
}

export default ShopService;
