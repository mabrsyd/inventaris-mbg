import { prisma } from '../../../database';
import { NotFoundError, BadRequestError, ConflictError } from '../../../core/errors';
import { getPaginationParams } from '../../../app/utils';

export interface CreatePODto {
  supplierId: string;
  destinationLocationId: string;
  expectedDeliveryDate?: Date;
  notes?: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitPrice?: number;
  }>;
}

export interface UpdatePODto {
  expectedDeliveryDate?: Date;
  notes?: string;
  items?: Array<{
    itemId: string;
    quantity: number;
    unitPrice?: number;
  }>;
}

export class PurchaseOrderService {
  async createPO(data: CreatePODto, creatorId: string) {
    console.log('📦 Creating PO with data:', JSON.stringify(data, null, 2));
    console.log('📦 Items count:', data.items?.length);
    
    // Validate supplier
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });

    if (!supplier || !supplier.isActive) {
      throw new BadRequestError('Supplier tidak valid atau tidak aktif');
    }

    // Validate location
    const location = await prisma.location.findUnique({
      where: { id: data.destinationLocationId },
    });

    if (!location || !location.isActive) {
      throw new BadRequestError('Lokasi tidak valid atau tidak aktif');
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('PO harus memiliki minimal 1 item');
    }

    console.log('✅ Items validation passed. Processing items...');

    // Generate PO Number
    const poNumber = await this.generatePONumber();
    console.log('✅ PO Number generated:', poNumber);

    // Calculate total amount
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of data.items) {
      console.log('Processing item:', item);
      
      const itemData = await prisma.item.findUnique({
        where: { id: item.itemId },
      });

      if (!itemData || !itemData.isActive) {
        throw new BadRequestError(`Item ${item.itemId} tidak valid`);
      }

      const unitPrice = item.unitPrice || itemData.price;
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;

      validatedItems.push({
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
      
      console.log(`✅ Item validated: ${itemData.name}, qty: ${item.quantity}, price: ${unitPrice}`);
    }

    console.log('✅ Total amount calculated:', totalAmount);
    console.log('✅ Creating PO in database...');

    // Create PO with items
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId: data.supplierId,
        destinationLocationId: data.destinationLocationId,
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : undefined,
        totalAmount,
        notes: data.notes,
        createdById: creatorId,
        status: 'DRAFT',
        items: {
          create: validatedItems,
        },
      },
      include: {
        supplier: true,
        destinationLocation: true,
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
        action: 'CREATE_PURCHASE_ORDER',
        actionType: 'CREATE',
        entityType: 'PurchaseOrder',
        entityId: po.id,
        userId: creatorId,
        newValues: { poNumber: po.poNumber, totalAmount } as any,
      },
    });

    return po;
  }

  async getPOs(query: any) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};

    if (query.status) where.status = query.status;
    if (query.supplierId) where.supplierId = query.supplierId;
    if (query.destinationLocationId) where.destinationLocationId = query.destinationLocationId;

    if (query.search) {
      where.OR = [
        { poNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [pos, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          supplier: true,
          destinationLocation: true,
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return { pos, total, page, limit };
  }

  async getPOById(id: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        destinationLocation: true,
        items: {
          include: {
            item: true,
          },
        },
        goodsReceipts: {
          select: {
            id: true,
            receiptNumber: true,
            receivedDate: true,
            qcStatus: true,
          },
        },
      },
    });

    if (!po) {
      throw new NotFoundError('Purchase Order tidak ditemukan');
    }

    return po;
  }

  async updatePO(id: string, data: UpdatePODto, updaterId: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!po) {
      throw new NotFoundError('Purchase Order tidak ditemukan');
    }

    if (po.status !== 'DRAFT') {
      throw new BadRequestError('Hanya PO dengan status DRAFT yang dapat diupdate');
    }

    let updateData: any = {
      expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : undefined,
      notes: data.notes,
    };

    // Update items if provided
    if (data.items && data.items.length > 0) {
      // Delete existing items
      await prisma.pOItem.deleteMany({
        where: { purchaseOrderId: id },
      });

      // Calculate new total
      let totalAmount = 0;
      const validatedItems = [];

      for (const item of data.items) {
        const itemData = await prisma.item.findUnique({
          where: { id: item.itemId },
        });

        if (!itemData) {
          throw new BadRequestError(`Item ${item.itemId} tidak valid`);
        }

        const unitPrice = item.unitPrice || itemData.price;
        const totalPrice = unitPrice * item.quantity;
        totalAmount += totalPrice;

        validatedItems.push({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        });
      }

      updateData.totalAmount = totalAmount;
      updateData.items = {
        create: validatedItems,
      };
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        destinationLocation: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_PURCHASE_ORDER',
        actionType: 'UPDATE',
        entityType: 'PurchaseOrder',
        entityId: id,
        userId: updaterId,
        newValues: data as any,
      },
    });

    return updated;
  }

  async submitForApproval(id: string, userId: string) {
    return this.updatePOStatus(id, 'PENDING_APPROVAL', userId);
  }

  async approvePO(id: string, userId: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!po) {
      throw new NotFoundError('Purchase Order tidak ditemukan');
    }

    if (po.status !== 'PENDING_APPROVAL') {
      throw new BadRequestError('PO harus dalam status PENDING_APPROVAL');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById: userId,
        approvedAt: new Date(),
      },
      include: {
        supplier: true,
        destinationLocation: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'APPROVE_PURCHASE_ORDER',
        actionType: 'APPROVE',
        entityType: 'PurchaseOrder',
        entityId: id,
        userId,
      },
    });

    return updated;
  }

  async confirmPO(id: string, userId: string) {
    return this.updatePOStatus(id, 'CONFIRMED', userId);
  }

  async markAsShipped(id: string, userId: string) {
    return this.updatePOStatus(id, 'SHIPPED', userId);
  }

  async cancelPO(id: string, reason: string, userId: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!po) {
      throw new NotFoundError('Purchase Order tidak ditemukan');
    }

    if (['RECEIVED', 'CANCELLED'].includes(po.status)) {
      throw new BadRequestError('PO tidak dapat dibatalkan');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: `${po.notes || ''}\n[CANCELLED] ${reason}`,
      },
      include: {
        supplier: true,
        destinationLocation: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CANCEL_PURCHASE_ORDER',
        actionType: 'UPDATE',
        entityType: 'PurchaseOrder',
        entityId: id,
        userId,
        newValues: { status: 'CANCELLED', reason } as any,
      },
    });

    return updated;
  }

  private async updatePOStatus(id: string, status: string, userId: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!po) {
      throw new NotFoundError('Purchase Order tidak ditemukan');
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: status as any },
      include: {
        supplier: true,
        destinationLocation: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: `UPDATE_PO_STATUS_${status}`,
        actionType: 'UPDATE',
        entityType: 'PurchaseOrder',
        entityId: id,
        userId,
        newValues: { status } as any,
      },
    });

    return updated;
  }

  private async generatePONumber(): Promise<string> {
    const prefix = 'PO';
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
