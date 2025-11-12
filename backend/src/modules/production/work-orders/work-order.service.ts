import { prisma } from '../../../database';
import { NotFoundError, BadRequestError } from '../../../core/errors';
import { getPaginationParams } from '../../../app/utils';

export interface CreateWorkOrderDto {
  recipeId: string;
  kitchenLocationId: string;
  plannedQuantity: number;
  plannedPortions?: number;
  scheduledDate?: string | Date;
  notes?: string;
}

export interface RecordOutputDto {
  itemId: string;
  quantity: number;
  unit: string;
  batchNumber?: string;
  expiryDate?: string | Date;
  productionDate?: string | Date;
  qcPassed?: boolean;
  qcNotes?: string;
}

export class WorkOrderService {
  async createWorkOrder(data: CreateWorkOrderDto, userId: string) {
    const recipe = await prisma.recipe.findUnique({
      where: { id: data.recipeId },
      include: { recipeItems: { include: { item: true } } },
    });

    if (!recipe) {
      throw new NotFoundError('Resep tidak ditemukan');
    }

    const location = await prisma.location.findUnique({ where: { id: data.kitchenLocationId } });
    if (!location) {
      throw new NotFoundError('Lokasi dapur tidak ditemukan');
    }

    // scale factor based on portionSize
    const scale = data.plannedQuantity / recipe.portionSize;

    // create work order
    const wo = await prisma.workOrder.create({
      data: {
        woNumber: `WO${Date.now()}`,
        recipeId: data.recipeId,
        kitchenLocationId: data.kitchenLocationId,
        plannedQuantity: data.plannedQuantity,
        plannedPortions: data.plannedPortions || data.plannedQuantity,
        totalCost: recipe.totalCost ? recipe.totalCost * scale : undefined,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        notes: data.notes,
        createdById: userId,
        recipeItems: {
          create: recipe.recipeItems.map(ri => ({
            itemId: ri.itemId,
            quantity: ri.quantity * scale,
          })),
        },
      },
      include: {
        recipe: { include: { recipeItems: { include: { item: true } } } },
        kitchenLocation: true,
        recipeItems: { include: { item: true } },
      },
    });

    // attach ingredients field for frontend compatibility
    return {
      ...wo,
      ingredients: (wo.recipeItems || []).map((ri: any) => ({
        itemId: ri.itemId,
        quantity: ri.quantity,
        unit: ri.item?.unit,
      })),
    };
  }

  async getWorkOrders(query: any) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.recipeId) where.recipeId = query.recipeId;

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          recipe: true,
          kitchenLocation: true,
          recipeItems: { include: { item: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workOrder.count({ where }),
    ]);

    const mapped = workOrders.map(wo => ({
      ...wo,
      ingredients: (wo.recipeItems || []).map((ri: any) => ({
        itemId: ri.itemId,
        quantity: ri.quantity,
        unit: ri.item?.unit,
      })),
    }));

    return { workOrders: mapped, total, page, limit };
  }

  async getWOById(id: string) {
    const wo = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        recipe: { include: { recipeItems: { include: { item: true } } } },
        kitchenLocation: true,
        recipeItems: { include: { item: true } },
        outputs: { include: { item: true } },
      },
    });

    if (!wo) throw new NotFoundError('Work Order tidak ditemukan');

    return {
      ...wo,
      ingredients: (wo.recipeItems || []).map((ri: any) => ({
        itemId: ri.itemId,
        quantity: ri.quantity,
        unit: ri.item?.unit,
      })),
    };
  }

  async startProduction(id: string, userId: string) {
    const wo = await prisma.workOrder.findUnique({
      where: { id },
      include: { recipeItems: true, kitchenLocation: true },
    });

    if (!wo) throw new NotFoundError('Work Order tidak ditemukan');

    // check stock availability at kitchen location
    for (const ri of wo.recipeItems) {
      const stockAgg = await prisma.stock.aggregate({
        where: { itemId: ri.itemId, locationId: wo.kitchenLocationId },
        _sum: { quantity: true },
      });

      const available = (stockAgg._sum.quantity as number) || 0;
      if (available < ri.quantity) {
        throw new BadRequestError(`Stok tidak cukup untuk item ${ri.itemId}. Diperlukan: ${ri.quantity}, Tersedia: ${available}`);
      }
    }

    const updated = await prisma.workOrder.update({
      where: { id },
      data: { status: 'IN_PROGRESS', startDate: new Date() },
      include: { recipeItems: { include: { item: true } } },
    });

    return {
      ...updated,
      ingredients: (updated.recipeItems || []).map((ri: any) => ({
        itemId: ri.itemId,
        quantity: ri.quantity,
        unit: ri.item?.unit,
      })),
    };
  }

  async recordOutput(id: string, data: RecordOutputDto, userId: string) {
    const wo = await prisma.workOrder.findUnique({ where: { id }, include: { kitchenLocation: true } });
    if (!wo) throw new NotFoundError('Work Order tidak ditemukan');

    // create production output
    const output = await prisma.productionOutput.create({
      data: {
        workOrderId: id,
        itemId: data.itemId,
        quantity: data.quantity,
        unit: data.unit as any,
        batchNumber: data.batchNumber,
        productionDate: data.productionDate ? new Date((data as any).productionDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        qcPassed: data.qcPassed ?? true,
        qcNotes: data.qcNotes,
      },
      include: { item: true },
    });

    // reduce stock from kitchen location if available
    // find available stock record
    const stock = await prisma.stock.findFirst({ where: { itemId: data.itemId, locationId: wo.kitchenLocationId } });
    if (stock) {
      const newQty = stock.quantity - data.quantity;
      if (newQty < 0) {
        throw new BadRequestError('Stok tidak cukup untuk mencatat output');
      }

      await prisma.stock.update({ where: { id: stock.id }, data: { quantity: newQty } });

      await prisma.stockLedger.create({
        data: {
          itemId: data.itemId,
          locationId: wo.kitchenLocationId,
          change: -data.quantity,
          balance: newQty,
          mutationType: 'PRODUCTION_OUTPUT',
          referenceType: 'WORK_ORDER',
          referenceId: id,
          workOrderId: id,
          createdById: userId,
        },
      });

      await prisma.stockMutation.create({
        data: {
          stockId: stock.id,
          itemId: data.itemId,
          quantity: -data.quantity,
          mutationType: 'PRODUCTION_OUTPUT',
          referenceType: 'WORK_ORDER',
          referenceId: id,
          workOrderId: id,
          createdById: userId,
        },
      });
    }

    return output;
  }

  async completeProduction(id: string, userId: string) {
    const wo = await prisma.workOrder.findUnique({ where: { id }, include: { recipeItems: { include: { item: true } }, outputs: true } });
    if (!wo) throw new NotFoundError('Work Order tidak ditemukan');

    const updated = await prisma.workOrder.update({ where: { id }, data: { status: 'COMPLETED', completionDate: new Date() }, include: { recipeItems: { include: { item: true } }, outputs: true } });

    return {
      ...updated,
      ingredients: (updated.recipeItems || []).map((ri: any) => ({
        itemId: ri.itemId,
        quantity: ri.quantity,
        unit: ri.item?.unit,
      })),
    };
  }

  async cancelWorkOrder(id: string, reason: string, userId: string) {
    const wo = await prisma.workOrder.findUnique({ where: { id } });
    if (!wo) throw new NotFoundError('Work Order tidak ditemukan');

    const updated = await prisma.workOrder.update({ where: { id }, data: { status: 'CANCELLED', notes: `${wo.notes || ''}\nCANCEL_REASON: ${reason}` }, include: { recipeItems: { include: { item: true } } } });

    return {
      ...updated,
      ingredients: (updated.recipeItems || []).map((ri: any) => ({
        itemId: ri.itemId,
        quantity: ri.quantity,
        unit: ri.item?.unit,
      })),
    };
  }
}

export default WorkOrderService;
