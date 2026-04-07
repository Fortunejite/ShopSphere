import { countCategories, create, findAll } from "@/repositories/category.repository";
import { authorizeUser } from "./user.service";
import slugify from "slugify";

class CategoryService {
  static async getAllCategories() {
    return await findAll();
  }

  static async createCategory(data: { name: string; parent_id?: number }) {
    const user = await authorizeUser();
    if (user.role !== 'admin') {
      throw { message: 'Unauthorized', status: 403 };
    }
    const slug = slugify(data.name, { lower: true, strict: true });
    return await create({ ...data, slug });
  }

  static async verifyCategoriesExists(categoryIds: number[]) {
    const count = await countCategories(categoryIds);
    if (count !== categoryIds.length) {
      throw { message: 'One or more category IDs are invalid', status: 400 };
    }
  }
}

export default CategoryService;