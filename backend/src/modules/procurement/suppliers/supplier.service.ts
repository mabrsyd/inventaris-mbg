import { prisma } from '../../../database';
import { NotFoundError, ConflictError } from '../../../core/errors';
import { getPaginationParams } from '../../../app/utils';

export interface CreateSupplierDto {
  code?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  verified?: boolean;
  rating?: number;
  isActive?: boolean;
}

export interface ListSuppliersQuery {
  page?: number;
  limit?: number;
  search?: string;
  verified?: boolean;
  isActive?: boolean;
}

export class SupplierService {
  async createSupplier(data: CreateSupplierDto, creatorId: string) {
    if (data.code) {
      const existing = await prisma.supplier.findUnique({
        where: { code: data.code },
      });

      if (existing) {
        throw new ConflictError('Kode supplier sudah ada');
      }
    }

    const supplier = await prisma.supplier.create({
      data: {
        code: data.code,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_SUPPLIER',
        actionType: 'CREATE',
        entityType: 'Supplier',
        entityId: supplier.id,
        userId: creatorId,
        newValues: supplier as any,
      },
    });

    return supplier;
  }

  async getSuppliers(query: ListSuppliersQuery) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.verified !== undefined) {
      where.verified = query.verified;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { purchaseOrders: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.supplier.count({ where }),
    ]);

    return { suppliers, total, page, limit };
  }

  async getSupplierById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            poNumber: true,
            status: true,
            totalAmount: true,
            documentDate: true,
          },
        },
        _count: {
          select: { purchaseOrders: true },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundError('Supplier tidak ditemukan');
    }

    return supplier;
  }

  async updateSupplier(id: string, data: UpdateSupplierDto, updaterId: string) {
    const existing = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Supplier tidak ditemukan');
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_SUPPLIER',
        actionType: 'UPDATE',
        entityType: 'Supplier',
        entityId: id,
        userId: updaterId,
        oldValues: existing as any,
        newValues: data as any,
      },
    });

    return supplier;
  }

  async deleteSupplier(id: string, deleterId: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { purchaseOrders: true },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundError('Supplier tidak ditemukan');
    }

    if (supplier._count.purchaseOrders > 0) {
      throw new ConflictError('Supplier tidak dapat dihapus karena memiliki purchase order');
    }

    await prisma.supplier.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_SUPPLIER',
        actionType: 'DELETE',
        entityType: 'Supplier',
        entityId: id,
        userId: deleterId,
        oldValues: supplier as any,
      },
    });

    return { message: 'Supplier berhasil dihapus' };
  }

  async verifySupplier(id: string, verified: boolean, verifierId: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundError('Supplier tidak ditemukan');
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: { verified },
    });

    await prisma.auditLog.create({
      data: {
        action: verified ? 'VERIFY_SUPPLIER' : 'UNVERIFY_SUPPLIER',
        actionType: 'UPDATE',
        entityType: 'Supplier',
        entityId: id,
        userId: verifierId,
        newValues: { verified } as any,
      },
    });

    return updated;
  }

  async updateSupplierRating(id: string, rating: number, updaterId: string) {
    if (rating < 0 || rating > 5) {
      throw new ConflictError('Rating harus antara 0-5');
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundError('Supplier tidak ditemukan');
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: { rating },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_SUPPLIER_RATING',
        actionType: 'UPDATE',
        entityType: 'Supplier',
        entityId: id,
        userId: updaterId,
        oldValues: { rating: supplier.rating } as any,
        newValues: { rating } as any,
      },
    });

    return updated;
  }
}
