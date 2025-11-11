import { prisma } from '../../../database';
import { NotFoundError, ConflictError } from '../../../core/errors';
import { getPaginationParams } from '../../../app/utils';

export interface CreateItemDto {
  sku: string;
  code?: string;
  name: string;
  description?: string;
  itemType: string;
  unit: string;
  categoryId?: string;
  price?: number;
  reorderPoint?: number;
  shelfLifeDays?: number;
  requiresColdStorage?: boolean;
  isConsumable?: boolean;
  nutritionalInfo?: any;
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  itemType?: string;
  unit?: string;
  categoryId?: string;
  price?: number;
  reorderPoint?: number;
  shelfLifeDays?: number;
  requiresColdStorage?: boolean;
  isConsumable?: boolean;
  nutritionalInfo?: any;
  isActive?: boolean;
}

export class ItemService {
  async createItem(data: CreateItemDto, creatorId: string) {
    const existing = await prisma.item.findUnique({
      where: { sku: data.sku },
    });

    if (existing) {
      throw new ConflictError('SKU sudah ada');
    }

    if (data.code) {
      const existingCode = await prisma.item.findUnique({
        where: { code: data.code },
      });

      if (existingCode) {
        throw new ConflictError('Kode item sudah ada');
      }
    }

    const item = await prisma.item.create({
      data: {
        sku: data.sku,
        code: data.code,
        name: data.name,
        description: data.description,
        itemType: data.itemType as any,
        unit: data.unit as any,
        categoryId: data.categoryId,
        price: data.price || 0,
        reorderPoint: data.reorderPoint || 0,
        shelfLifeDays: data.shelfLifeDays,
        requiresColdStorage: data.requiresColdStorage || false,
        isConsumable: data.isConsumable || false,
        nutritionalInfo: data.nutritionalInfo,
      },
      include: {
        category: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_ITEM',
        actionType: 'CREATE',
        entityType: 'Item',
        entityId: item.id,
        userId: creatorId,
        newValues: item as any,
      },
    });

    return item;
  }

  async getItems(query: any) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};

    if (query.itemType) where.itemType = query.itemType;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          stock: {
            select: {
              id: true,
              quantity: true,
              reservedQuantity: true,
              locationId: true,
              batchNumber: true,
              expiryDate: true,
            },
          },
          _count: {
            select: { stock: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.item.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getItemById(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        stock: {
          include: {
            location: true,
          },
        },
        _count: {
          select: {
            poItems: true,
            grItems: true,
            doItems: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundError('Item tidak ditemukan');
    }

    return item;
  }

  async updateItem(id: string, data: UpdateItemDto, updaterId: string) {
    const existing = await prisma.item.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Item tidak ditemukan');
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        itemType: data.itemType as any,
        unit: data.unit as any,
        categoryId: data.categoryId,
        price: data.price,
        reorderPoint: data.reorderPoint,
        shelfLifeDays: data.shelfLifeDays,
        requiresColdStorage: data.requiresColdStorage,
        isConsumable: data.isConsumable,
        nutritionalInfo: data.nutritionalInfo,
        isActive: data.isActive,
      },
      include: {
        category: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_ITEM',
        actionType: 'UPDATE',
        entityType: 'Item',
        entityId: id,
        userId: updaterId,
        oldValues: existing as any,
        newValues: data as any,
      },
    });

    return item;
  }

  async deleteItem(id: string, deleterId: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        _count: {
          select: { stock: true, poItems: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundError('Item tidak ditemukan');
    }

    if (item._count.stock > 0 || item._count.poItems > 0) {
      throw new ConflictError('Item tidak dapat dihapus karena masih memiliki data terkait');
    }

    await prisma.item.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_ITEM',
        actionType: 'DELETE',
        entityType: 'Item',
        entityId: id,
        userId: deleterId,
        oldValues: item as any,
      },
    });

    return { message: 'Item berhasil dihapus' };
  }

  async getItemStockSummary(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        stock: {
          include: {
            location: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundError('Item tidak ditemukan');
    }

    const totalStock = item.stock.reduce((sum, s) => sum + s.quantity, 0);
    const totalReserved = item.stock.reduce((sum, s) => sum + s.reservedQuantity, 0);
    const available = totalStock - totalReserved;

    return {
      item: {
        id: item.id,
        sku: item.sku,
        name: item.name,
        unit: item.unit,
        reorderPoint: item.reorderPoint,
      },
      summary: {
        totalStock,
        totalReserved,
        available,
        needsReorder: totalStock <= item.reorderPoint,
      },
      byLocation: item.stock,
    };
  }
}
