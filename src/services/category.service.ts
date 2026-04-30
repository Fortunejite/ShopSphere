import {
  countCategories,
  create,
  deleteCategory as _deleteCategory,
  find,
  findByIdAndShop,
  updateCategory as _updateCategory,
} from '@/repositories/category.repository';
import { authorizeUser } from './user.service';
import slugify from 'slugify';
import ShopService from './shop.service';

class CategoryService {
  static async getShopCategories(domain: string) {
    const shop = await ShopService.getShopByDomain(domain);
    return await find(shop.id);
  }

  static async createCategory(data: { name: string; domain: string }) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(data.domain);
    if (shop.owner_id !== user.id) {
      throw { message: 'Unauthorized', status: 403 };
    }
    const slug = slugify(data.name, { lower: true, strict: true });
    return await create({
      name: data.name,
      slug,
      shop: { connect: { id: shop.id } },
    });
  }

  static async deleteCategory(id: number, domain: string) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(domain);
    if (shop.owner_id !== user.id) {
      throw { message: 'Unauthorized', status: 403 };
    }

    const category = await findByIdAndShop(id, shop.id);
    if (!category) {
      throw { message: 'Category not found', status: 404 };
    }

    await _deleteCategory(id);
  }

  static async updateCategory(id: number, data: { name: string; domain: string }) {
    const user = await authorizeUser();
    const shop = await ShopService.getShopByDomain(data.domain);
    if (shop.owner_id !== user.id) {
      throw { message: 'Unauthorized', status: 403 };
    }

    const category = await findByIdAndShop(id, shop.id);
    if (!category) {
      throw { message: 'Category not found', status: 404 };
    }

    const slug = slugify(data.name, { lower: true, strict: true });
    return await _updateCategory(id, {
      name: data.name,
      slug,
    });
  }

  static async verifyCategoriesExists(categoryIds: number[]) {
    const count = await countCategories(categoryIds);
    if (count !== categoryIds.length) {
      throw { message: 'One or more category IDs are invalid', status: 400 };
    }
  }
}

export default CategoryService;
