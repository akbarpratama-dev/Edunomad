import { categoryRepository } from "../repositories/category.repository";
import { BusinessRuleError, NotFoundError } from "../utils/errors";
import type { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator";

async function assertExists(id: string) {
  const category = await categoryRepository.findById(id);
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export const categoryService = {
  // GET /categories (public, paginated)
  async list(page: number, limit: number) {
    const { data, total } = await categoryRepository.findManyPaginated(page, limit);
    return { data, total, page, limit };
  },

  // GET /admin/categories (admin, full list)
  listAll() {
    return categoryRepository.findAll();
  },

  async create(input: CreateCategoryInput) {
    return categoryRepository.create(input);
  },

  async update(id: string, input: UpdateCategoryInput) {
    await assertExists(id);
    return categoryRepository.update(id, input);
  },

  async remove(id: string) {
    await assertExists(id);
    const inUse = await categoryRepository.countProjects(id);
    if (inUse > 0) {
      throw new BusinessRuleError("Category is used by existing projects and cannot be deleted");
    }
    await categoryRepository.delete(id);
  },
};
