import { prisma } from '../../../database';
import { NotFoundError, BadRequestError } from '../../../core/errors';
import { getPaginationParams } from '../../../app/utils';
import { executeInTransaction } from '../../../database';

export interface StockAdjustmentDto {
  itemId: string;
  locationId: string;
  quantity: number;
  reason: string;
  batchNumber?: string;
  expiryDate?: Date;
}

export class StockService {
  async getStock(query: any) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};

    if (query.itemId) where.itemId = query.itemId;
    if (query.locationId) where.locationId = query.locationId;
    if (query.batchNumber) where.batchNumber = query.batchNumber;

    const [stocks, total] = await Promise.all([
      prisma.stock.findMany({
        where,
        skip,
        take: limit,
        include: {
          item: {
            select: {
              id: true,
              sku: true,
              name: true,
              unit: true,
              itemType: true,
            },
          },
          location: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.stock.count({ where }),
    ]);

    return { stocks, total, page, limit };
  }

  async getStockById(id: string) {
    const stock = await prisma.stock.findUnique({
      where: { id },
      include: {
        item: true,
        location: true,
      },
    });

    if (!stock) {
      throw new NotFoundError('Stock tidak ditemukan');
    }

    return stock;
  }

  async adjustStock(data: StockAdjustmentDto, userId: string) {
    const item = await prisma.item.findUnique({
      where: { id: data.itemId },
    });

    if (!item) {
      throw new NotFoundError('Item tidak ditemukan');
    }

    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
    });

    if (!location) {
      throw new NotFoundError('Lokasi tidak ditemukan');
    }

    // Find or create stock record
    const stockKey = {
      itemId: data.itemId,
      locationId: data.locationId,
      batchNumber: data.batchNumber || null,
    };

    let stock = await prisma.stock.findUnique({
      where: {
        itemId_locationId_batchNumber: stockKey as any,
      },
    });

    if (!stock) {
      stock = await prisma.stock.create({
        data: {
          itemId: data.itemId,
          locationId: data.locationId,
          batchNumber: data.batchNumber,
          quantity: 0,
          expiryDate: data.expiryDate,
        },
      });
    }

    const newQuantity = stock.quantity + data.quantity;

    if (newQuantity < 0) {
      throw new BadRequestError('Quantity adjustment will result in negative stock');
    }

    // Update stock
    const updatedStock = await prisma.stock.update({
      where: { id: stock.id },
      data: {
        quantity: newQuantity,
      },
      include: {
        item: true,
        location: true,
      },
    });

    // Create stock ledger entry
    await prisma.stockLedger.create({
      data: {
        itemId: data.itemId,
        locationId: data.locationId,
        batchNumber: data.batchNumber,
        change: data.quantity,
        balance: newQuantity,
        mutationType: 'ADJUSTMENT',
        referenceType: 'STOCK_ADJUSTMENT',
        createdById: userId,
      },
    });

    // Create stock mutation
    await prisma.stockMutation.create({
      data: {
        stockId: stock.id,
        itemId: data.itemId,
        quantity: data.quantity,
        mutationType: 'ADJUSTMENT',
        notes: data.reason,
        createdById: userId,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'STOCK_ADJUSTMENT',
        actionType: 'UPDATE',
        entityType: 'Stock',
        entityId: stock.id,
        userId: userId,
        newValues: {
          quantity: data.quantity,
          reason: data.reason,
          newBalance: newQuantity,
        } as any,
      },
    });

    return updatedStock;
  }

  async getStockHistory(itemId: string, locationId?: string) {
    const where: any = { itemId };

    if (locationId) {
      where.locationId = locationId;
    }

    const history = await prisma.stockLedger.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
          },
        },
        location: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return history;
  }

  async getLowStockItems(locationId?: string) {
    const where: any = {
      isActive: true,
    };

    const items = await prisma.item.findMany({
      where,
      include: {
        stock: {
          where: locationId ? { locationId } : {},
        },
      },
    });

    const lowStockItems = items
      .map(item => {
        const totalStock = item.stock.reduce((sum, s) => sum + s.quantity, 0);
        return {
          ...item,
          totalStock,
          needsReorder: totalStock <= item.reorderPoint,
        };
      })
      .filter(item => item.needsReorder);

    return lowStockItems;
  }

  async getExpiringStock(days: number = 30, locationId?: string) {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + days);

    const where: any = {
      expiryDate: {
        lte: expiryThreshold,
        gte: new Date(),
      },
    };

    if (locationId) {
      where.locationId = locationId;
    }

    const expiringStock = await prisma.stock.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
          },
        },
        location: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    return expiringStock;
  }
}
