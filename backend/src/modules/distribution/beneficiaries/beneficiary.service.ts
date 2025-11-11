import { prisma } from '../../../database';
import { NotFoundError, BadRequestError } from '../../../core/errors';
import { getPaginationParams } from '../../../app/utils';

export interface CreateBeneficiaryDto {
  code?: string;
  name: string;
  type: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  targetQuota?: number;
}

export class BeneficiaryService {
  async createBeneficiary(data: CreateBeneficiaryDto, creatorId: string) {
    // Check if code already exists
    if (data.code) {
      const existing = await prisma.beneficiary.findUnique({
        where: { code: data.code },
      });

      if (existing) {
        throw new BadRequestError('Kode penerima manfaat sudah ada');
      }
    }

    const beneficiary = await prisma.beneficiary.create({
      data: data,
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_BENEFICIARY',
        actionType: 'CREATE',
        entityType: 'Beneficiary',
        entityId: beneficiary.id,
        userId: creatorId,
        newValues: { name: beneficiary.name } as any,
      },
    });

    return beneficiary;
  }

  async getBeneficiaries(query: any) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = { isActive: true };

    if (query.type) where.type = query.type;

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [beneficiaries, total] = await Promise.all([
      prisma.beneficiary.findMany({
        where,
        skip,
        take: limit,
        include: {
          locations: {
            include: {
              location: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          _count: {
            select: { deliveryOrders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.beneficiary.count({ where }),
    ]);

    return { beneficiaries, total, page, limit };
  }

  async getBeneficiaryById(id: string) {
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id },
      include: {
        locations: {
          include: {
            location: true,
          },
        },
        deliveryOrders: {
          select: {
            id: true,
            doNumber: true,
            status: true,
            scheduledDeliveryDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!beneficiary) {
      throw new NotFoundError('Penerima manfaat tidak ditemukan');
    }

    return beneficiary;
  }

  async updateBeneficiary(id: string, data: Partial<CreateBeneficiaryDto>, userId: string) {
    const existing = await prisma.beneficiary.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Penerima manfaat tidak ditemukan');
    }

    const updated = await prisma.beneficiary.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_BENEFICIARY',
        actionType: 'UPDATE',
        entityType: 'Beneficiary',
        entityId: id,
        userId,
        oldValues: existing as any,
        newValues: updated as any,
      },
    });

    return updated;
  }

  async deleteBeneficiary(id: string, userId: string) {
    const existing = await prisma.beneficiary.findUnique({
      where: { id },
      include: {
        deliveryOrders: {
          where: {
            status: {
              in: ['PENDING', 'IN_TRANSIT'],
            },
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Penerima manfaat tidak ditemukan');
    }

    if (existing.deliveryOrders.length > 0) {
      throw new BadRequestError('Tidak dapat menghapus penerima manfaat yang memiliki delivery order aktif');
    }

    // Soft delete
    const deleted = await prisma.beneficiary.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_BENEFICIARY',
        actionType: 'DELETE',
        entityType: 'Beneficiary',
        entityId: id,
        userId,
        oldValues: existing as any,
      },
    });

    return deleted;
  }

  async assignLocation(beneficiaryId: string, locationId: string, userId: string) {
    // Validate beneficiary
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id: beneficiaryId },
    });

    if (!beneficiary) {
      throw new NotFoundError('Penerima manfaat tidak ditemukan');
    }

    // Validate location
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundError('Lokasi tidak ditemukan');
    }

    // Check if already assigned
    const existing = await prisma.locationBeneficiary.findUnique({
      where: {
        locationId_beneficiaryId: {
          locationId,
          beneficiaryId,
        },
      },
    });

    if (existing) {
      throw new BadRequestError('Penerima manfaat sudah terdaftar di lokasi ini');
    }

    const assignment = await prisma.locationBeneficiary.create({
      data: {
        beneficiaryId,
        locationId,
      },
      include: {
        beneficiary: true,
        location: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'ASSIGN_BENEFICIARY_LOCATION',
        actionType: 'CREATE',
        entityType: 'LocationBeneficiary',
        entityId: assignment.id,
        userId,
        newValues: { beneficiaryId, locationId } as any,
      },
    });

    return assignment;
  }

  async unassignLocation(beneficiaryId: string, locationId: string, userId: string) {
    const assignment = await prisma.locationBeneficiary.findUnique({
      where: {
        locationId_beneficiaryId: {
          locationId,
          beneficiaryId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment tidak ditemukan');
    }

    await prisma.locationBeneficiary.delete({
      where: {
        locationId_beneficiaryId: {
          locationId,
          beneficiaryId,
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UNASSIGN_BENEFICIARY_LOCATION',
        actionType: 'DELETE',
        entityType: 'LocationBeneficiary',
        entityId: assignment.id,
        userId,
        oldValues: { beneficiaryId, locationId } as any,
      },
    });

    return { message: 'Berhasil menghapus assignment' };
  }
}
