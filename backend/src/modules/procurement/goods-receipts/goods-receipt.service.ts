import { prisma } from '../../../database';
import { NotFoundError, BadRequestError } from '../../../core/errors';
import { getPaginationParams } from '../../../app/utils';

export interface CreateGRDto {
  purchaseOrderId?: string;
  locationId: string;
  referenceDocument?: string;
  items: Array<{
    itemId: string;
    quantity: number;
    batchNumber?: string;
    expiryDate?: Date;
  }>;
}

export interface QCCheckDto {
  qcStatus: 'PASSED' | 'FAILED';
  qcNotes?: string;
}

export class GoodsReceiptService {
  async createGoodsReceipt(data: CreateGRDto, userId: string) {
    // Validate location
    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
    });

    if (!location || !location.isActive) {
      throw new BadRequestError('Lokasi tidak valid');
    }

    // Validate PO if provided
    if (data.purchaseOrderId) {
      const po = await prisma.purchaseOrder.findUnique({
        where: { id: data.purchaseOrderId },
      });

      if (!po) {
        throw new NotFoundError('Purchase Order tidak ditemukan');
      }

      if (!['SHIPPED', 'CONFIRMED', 'APPROVED'].includes(po.status)) {
        throw new BadRequestError('Status PO tidak valid untuk penerimaan barang');
      }
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('Goods Receipt harus memiliki minimal 1 item');
    }

    for (const item of data.items) {
      const itemData = await prisma.item.findUnique({
        where: { id: item.itemId },
      });

      if (!itemData || !itemData.isActive) {
        throw new BadRequestError(`Item ${item.itemId} tidak valid`);
      }
    }

    // Generate receipt number
    const receiptNumber = await this.generateReceiptNumber();

    // Create goods receipt
    const gr = await prisma.goodsReceipt.create({
      data: {
        receiptNumber,
        purchaseOrderId: data.purchaseOrderId,
        locationId: data.locationId,
        receivedById: userId,
        referenceDocument: data.referenceDocument,
        qcStatus: 'PENDING',
        items: {
          create: data.items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
          })),
        },
      },
      include: {
        location: true,
        purchaseOrder: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    // Update PO items received quantity if PO provided
    if (data.purchaseOrderId) {
      for (const item of data.items) {
        await prisma.pOItem.updateMany({
          where: {
            purchaseOrderId: data.purchaseOrderId,
            itemId: item.itemId,
          },
          data: {
            receivedQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_GOODS_RECEIPT',
        actionType: 'CREATE',
        entityType: 'GoodsReceipt',
        entityId: gr.id,
        userId,
        newValues: { receiptNumber: gr.receiptNumber } as any,
      },
    });

    return gr;
  }

  async getGoodsReceipts(query: any) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};

    if (query.qcStatus) where.qcStatus = query.qcStatus;
    if (query.locationId) where.locationId = query.locationId;
    if (query.purchaseOrderId) where.purchaseOrderId = query.purchaseOrderId;

    if (query.search) {
      where.OR = [
        { receiptNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [receipts, total] = await Promise.all([
      prisma.goodsReceipt.findMany({
        where,
        skip,
        take: limit,
        include: {
          location: true,
          purchaseOrder: {
            select: {
              poNumber: true,
              supplier: true,
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
            },
          },
        },
        orderBy: { receivedDate: 'desc' },
      }),
      prisma.goodsReceipt.count({ where }),
    ]);

    return { receipts, total, page, limit };
  }

  async getGRById(id: string) {
    const gr = await prisma.goodsReceipt.findUnique({
      where: { id },
      include: {
        location: true,
        purchaseOrder: {
          include: {
            supplier: true,
          },
        },
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!gr) {
      throw new NotFoundError('Goods Receipt tidak ditemukan');
    }

    return gr;
  }

  async performQC(id: string, data: QCCheckDto, userId: string) {
    const gr = await prisma.goodsReceipt.findUnique({
      where: { id },
      include: {
        items: true,
        location: true,
      },
    });

    if (!gr) {
      throw new NotFoundError('Goods Receipt tidak ditemukan');
    }

    if (gr.qcStatus !== 'PENDING') {
      throw new BadRequestError('QC sudah dilakukan untuk goods receipt ini');
    }

    // Update GR status
    const updated = await prisma.goodsReceipt.update({
      where: { id },
      data: {
        qcStatus: data.qcStatus,
        qcNotes: data.qcNotes,
        qcById: userId,
        qcDate: new Date(),
      },
      include: {
        location: true,
        purchaseOrder: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    // If QC passed, update stock
    if (data.qcStatus === 'PASSED') {
      for (const grItem of gr.items) {
        // Find or create stock
        const stockKey = {
          itemId: grItem.itemId,
          locationId: gr.locationId,
          batchNumber: grItem.batchNumber || null,
        };

        let stock = await prisma.stock.findFirst({
          where: stockKey,
        });

        if (!stock) {
          stock = await prisma.stock.create({
            data: {
              itemId: grItem.itemId,
              locationId: gr.locationId,
              batchNumber: grItem.batchNumber,
              quantity: grItem.quantity,
              expiryDate: grItem.expiryDate,
            },
          });
        } else {
          stock = await prisma.stock.update({
            where: { id: stock.id },
            data: {
              quantity: {
                increment: grItem.quantity,
              },
            },
          });
        }

        // Create stock ledger entry
        await prisma.stockLedger.create({
          data: {
            itemId: grItem.itemId,
            locationId: gr.locationId,
            batchNumber: grItem.batchNumber,
            change: grItem.quantity,
            balance: stock.quantity,
            mutationType: 'RECEIPT',
            referenceType: 'GOODS_RECEIPT',
            referenceId: gr.id,
            createdById: userId,
          },
        });

        // Create stock mutation
        await prisma.stockMutation.create({
          data: {
            stockId: stock.id,
            itemId: grItem.itemId,
            quantity: grItem.quantity,
            mutationType: 'RECEIPT',
            referenceType: 'GOODS_RECEIPT',
            referenceId: gr.id,
            destLocationId: gr.locationId,
            createdById: userId,
          },
        });
      }

      // Update PO status to RECEIVED if all items received
      if (gr.purchaseOrderId) {
        const po = await prisma.purchaseOrder.findUnique({
          where: { id: gr.purchaseOrderId },
          include: { items: true },
        });

        if (po) {
          const allReceived = po.items.every(
            item => item.receivedQuantity >= item.quantity
          );

          if (allReceived) {
            await prisma.purchaseOrder.update({
              where: { id: gr.purchaseOrderId },
              data: { status: 'RECEIVED' },
            });
          }
        }
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: data.qcStatus === 'PASSED' ? 'QC_PASSED' : 'QC_FAILED',
        actionType: 'UPDATE',
        entityType: 'GoodsReceipt',
        entityId: id,
        userId,
        newValues: data as any,
      },
    });

    return updated;
  }

  async updateQCStatus(id: string, data: { qcStatus: 'PASSED' | 'FAILED' | 'PENDING'; qcNotes?: string; qcDate?: string }, userId: string) {
    const gr = await prisma.goodsReceipt.findUnique({
      where: { id },
      include: {
        items: true,
        location: true,
      },
    });

    if (!gr) {
      throw new NotFoundError('Goods Receipt tidak ditemukan');
    }

    // Update GR QC status
    const updated = await prisma.goodsReceipt.update({
      where: { id },
      data: {
        qcStatus: data.qcStatus,
        qcNotes: data.qcNotes,
        qcById: userId,
        qcDate: data.qcDate ? new Date(data.qcDate) : new Date(),
      },
      include: {
        location: true,
        purchaseOrder: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'QC_STATUS_UPDATED',
        actionType: 'UPDATE',
        entityType: 'GoodsReceipt',
        entityId: id,
        userId,
        newValues: data as any,
      },
    });

    return updated;
  }

  private async generateReceiptNumber(): Promise<string> {
    const prefix = 'GR';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    const key = `${prefix}-${year}${month}`;

    const sequence = await prisma.sequenceNumber.upsert({
      where: { key },
      create: {
        key,
        last: 1,
      },
      update: {
        last: {
          increment: 1,
        },
      },
    });

    return `${prefix}${year}${month}${sequence.last.toString().padStart(4, '0')}`;
  }
}
