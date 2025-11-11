import { prisma } from '../../../database';
import { NotFoundError, BadRequestError } from '../../../core/errors';
import { getPaginationParams } from '../../../app/utils';
import { executeInTransaction } from '../../../database/transaction';

export interface CreateDeliveryOrderDto {
  sourceLocationId: string;
  destinationLocationId: string;
  beneficiaryId?: string;
  workOrderId?: string;
  scheduledDeliveryDate?: Date | string;
  transportInfo?: any;
  referenceDocument?: string;
  notes?: string;
  items: {
    itemId: string;
    quantity: number;
    batchNumber?: string;
  }[];
}

export class DeliveryOrderService {
  async createDeliveryOrder(data: CreateDeliveryOrderDto, creatorId: string) {
    return executeInTransaction(async (tx) => {
      // Validate source location
      const sourceLocation = await tx.location.findUnique({
        where: { id: data.sourceLocationId },
      });

      if (!sourceLocation || !sourceLocation.isActive) {
        throw new BadRequestError('Lokasi asal tidak valid');
      }

      // Validate destination location
      const destLocation = await tx.location.findUnique({
        where: { id: data.destinationLocationId },
      });

      if (!destLocation || !destLocation.isActive) {
        throw new BadRequestError('Lokasi tujuan tidak valid');
      }

      // Validate beneficiary if provided
      if (data.beneficiaryId) {
        const beneficiary = await tx.beneficiary.findUnique({
          where: { id: data.beneficiaryId },
        });

        if (!beneficiary || !beneficiary.isActive) {
          throw new BadRequestError('Penerima manfaat tidak valid');
        }
      }

      // Generate DO number
      const count = await tx.deliveryOrder.count();
      const doNumber = `DO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;

      // Validate stock availability for each item
      for (const item of data.items) {
        const stock = await tx.stock.findFirst({
          where: {
            itemId: item.itemId,
            locationId: data.sourceLocationId,
            batchNumber: item.batchNumber || null,
            quantity: { gte: item.quantity },
          },
        });

        if (!stock) {
          const itemInfo = await tx.item.findUnique({ where: { id: item.itemId } });
          throw new BadRequestError(`Stock tidak mencukupi untuk item: ${itemInfo?.name}`);
        }
      }

      // Create delivery order
      const doOrder = await tx.deliveryOrder.create({
        data: {
          doNumber,
          sourceLocationId: data.sourceLocationId,
          destinationLocationId: data.destinationLocationId,
          beneficiaryId: data.beneficiaryId,
          workOrderId: data.workOrderId,
          scheduledDeliveryDate: data.scheduledDeliveryDate ? new Date(data.scheduledDeliveryDate) : null,
          transportInfo: data.transportInfo,
          referenceDocument: data.referenceDocument,
          notes: data.notes,
          createdById: creatorId,
        },
        include: {
          sourceLocation: true,
          destinationLocation: true,
          beneficiary: true,
        },
      });

      // Create DO items
      for (const item of data.items) {
        await tx.dOItem.create({
          data: {
            deliveryOrderId: doOrder.id,
            itemId: item.itemId,
            quantity: item.quantity,
            batchNumber: item.batchNumber,
          },
        });
      }

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'CREATE_DELIVERY_ORDER',
          actionType: 'CREATE',
          entityType: 'DeliveryOrder',
          entityId: doOrder.id,
          userId: creatorId,
          newValues: { doNumber: doOrder.doNumber } as any,
        },
      });

      return doOrder;
    });
  }

  async getDeliveryOrders(query: any) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.sourceLocationId) where.sourceLocationId = query.sourceLocationId;
    if (query.destinationLocationId) where.destinationLocationId = query.destinationLocationId;
    if (query.beneficiaryId) where.beneficiaryId = query.beneficiaryId;

    if (query.search) {
      where.OR = [
        { doNumber: { contains: query.search, mode: 'insensitive' } },
        { referenceDocument: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [deliveryOrders, total] = await Promise.all([
      prisma.deliveryOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          sourceLocation: { select: { id: true, name: true, code: true } },
          destinationLocation: { select: { id: true, name: true, code: true } },
          beneficiary: { select: { id: true, name: true, code: true } },
          items: {
            include: {
              item: { select: { id: true, name: true, code: true, unit: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.deliveryOrder.count({ where }),
    ]);

    return { deliveryOrders, total, page, limit };
  }

  async getDeliveryOrderById(id: string) {
    const deliveryOrder = await prisma.deliveryOrder.findUnique({
      where: { id },
      include: {
        sourceLocation: true,
        destinationLocation: true,
        beneficiary: true,
        workOrder: true,
        items: {
          include: {
            item: true,
          },
        },
        mutations: {
          include: {
            stock: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    if (!deliveryOrder) {
      throw new NotFoundError('Delivery order tidak ditemukan');
    }

    return deliveryOrder;
  }

  async dispatchDeliveryOrder(id: string, userId: string) {
    return executeInTransaction(async (tx) => {
      const doOrder = await tx.deliveryOrder.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!doOrder) {
        throw new NotFoundError('Delivery order tidak ditemukan');
      }

      if (doOrder.status !== 'PENDING') {
        throw new BadRequestError('Hanya delivery order dengan status PENDING yang bisa di-dispatch');
      }

      // Update status
      const updated = await tx.deliveryOrder.update({
        where: { id },
        data: {
          status: 'IN_TRANSIT',
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'DISPATCH_DELIVERY_ORDER',
          actionType: 'UPDATE',
          entityType: 'DeliveryOrder',
          entityId: id,
          userId,
          newValues: { status: 'IN_TRANSIT' } as any,
        },
      });

      return updated;
    });
  }

  async confirmDelivery(id: string, userId: string) {
    return executeInTransaction(async (tx) => {
      const doOrder = await tx.deliveryOrder.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!doOrder) {
        throw new NotFoundError('Delivery order tidak ditemukan');
      }

      if (doOrder.status !== 'IN_TRANSIT') {
        throw new BadRequestError('Hanya delivery order dengan status IN_TRANSIT yang bisa dikonfirmasi');
      }

      // Deduct stock from source location using FEFO
      for (const doItem of doOrder.items) {
        const stocks = await tx.stock.findMany({
          where: {
            itemId: doItem.itemId,
            locationId: doOrder.sourceLocationId,
            quantity: { gt: 0 },
            ...(doItem.batchNumber && { batchNumber: doItem.batchNumber }),
          },
          orderBy: [
            { expiryDate: 'asc' },
            { createdAt: 'asc' },
          ],
        });

        let remainingQty = doItem.quantity;

        for (const stock of stocks) {
          if (remainingQty <= 0) break;

          const deductQty = Math.min(stock.quantity, remainingQty);

          // Update stock
          await tx.stock.update({
            where: { id: stock.id },
            data: { quantity: stock.quantity - deductQty },
          });

          // Create stock ledger entry
          await tx.stockLedger.create({
            data: {
              itemId: stock.itemId,
              locationId: stock.locationId,
              batchNumber: stock.batchNumber,
              change: -deductQty,
              balance: stock.quantity - deductQty,
              mutationType: 'DELIVERY',
              referenceType: 'DeliveryOrder',
              referenceId: doOrder.id,
              deliveryOrderId: doOrder.id,
              createdById: userId,
            },
          });

          // Create stock mutation
          await tx.stockMutation.create({
            data: {
              stockId: stock.id,
              itemId: stock.itemId,
              quantity: deductQty,
              mutationType: 'DELIVERY',
              referenceType: 'DeliveryOrder',
              referenceId: doOrder.id,
              sourceLocationId: doOrder.sourceLocationId,
              destLocationId: doOrder.destinationLocationId,
              deliveryOrderId: doOrder.id,
              createdById: userId,
            },
          });

          remainingQty -= deductQty;
        }

        if (remainingQty > 0) {
          throw new BadRequestError(`Stock tidak mencukupi untuk item ${doItem.itemId}`);
        }
      }

      // Update delivery order status
      const updated = await tx.deliveryOrder.update({
        where: { id },
        data: {
          status: 'DELIVERED',
          actualDeliveryDate: new Date(),
          confirmationBy: userId,
          confirmationDate: new Date(),
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'CONFIRM_DELIVERY',
          actionType: 'UPDATE',
          entityType: 'DeliveryOrder',
          entityId: id,
          userId,
          newValues: { status: 'DELIVERED' } as any,
        },
      });

      return updated;
    });
  }

  async cancelDeliveryOrder(id: string, reason: string, userId: string) {
    const doOrder = await prisma.deliveryOrder.findUnique({
      where: { id },
    });

    if (!doOrder) {
      throw new NotFoundError('Delivery order tidak ditemukan');
    }

    if (doOrder.status === 'DELIVERED') {
      throw new BadRequestError('Delivery order yang sudah delivered tidak bisa dibatalkan');
    }

    const updated = await prisma.deliveryOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: doOrder.notes ? `${doOrder.notes}\nDibatalkan: ${reason}` : `Dibatalkan: ${reason}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CANCEL_DELIVERY_ORDER',
        actionType: 'UPDATE',
        entityType: 'DeliveryOrder',
        entityId: id,
        userId,
        newValues: { status: 'CANCELLED', reason } as any,
      },
    });

    return updated;
  }
}
