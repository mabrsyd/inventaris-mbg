import { prisma } from '../../../database';
import { NotFoundError, ConflictError } from '../../../core/errors';
import { getPaginationParams } from '../../../app/utils';

export interface CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ListCategoriesQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export class CategoryService {
  async createCategory(data: CreateCategoryDto, creatorId: string) {
    const existing = await prisma.category.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictError('Kode kategori sudah ada');
    }

    const category = await prisma.category.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_CATEGORY',
        actionType: 'CREATE',
        entityType: 'Category',
        entityId: category.id,
        userId: creatorId,
        newValues: category as any,
      },
    });

    return category;
  }

  async getCategories(query: ListCategoriesQuery) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.category.count({ where }),
    ]);

    return { categories, total, page, limit };
  }

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('Kategori tidak ditemukan');
    }

    return category;
  }

  async updateCategory(id: string, data: UpdateCategoryDto, updaterId: string) {
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Kategori tidak ditemukan');
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_CATEGORY',
        actionType: 'UPDATE',
        entityType: 'Category',
        entityId: id,
        userId: updaterId,
        oldValues: existing as any,
        newValues: data as any,
      },
    });

    return category;
  }

  async deleteCategory(id: string, deleterId: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('Kategori tidak ditemukan');
    }

    if (category._count.items > 0) {
      throw new ConflictError('Kategori tidak dapat dihapus karena masih memiliki item');
    }

    await prisma.category.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_CATEGORY',
        actionType: 'DELETE',
        entityType: 'Category',
        entityId: id,
        userId: deleterId,
        oldValues: category as any,
      },
    });

    return { message: 'Kategori berhasil dihapus' };
  }
}
