import { prisma } from '../../../database';
import { NotFoundError, ConflictError } from '../../../core/errors';
import { getPaginationParams } from '../../../app/utils';

export interface CreateLocationDto {
  code: string;
  name: string;
  type: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacityKg?: number;
  phone?: string;
  managerName?: string;
}

export interface UpdateLocationDto {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacityKg?: number;
  phone?: string;
  managerName?: string;
  isActive?: boolean;
}

export class LocationService {
  async createLocation(data: CreateLocationDto, creatorId: string) {
    const existing = await prisma.location.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictError('Kode lokasi sudah ada');
    }

    const location = await prisma.location.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type as any,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        capacityKg: data.capacityKg,
        phone: data.phone,
        managerName: data.managerName,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_LOCATION',
        actionType: 'CREATE',
        entityType: 'Location',
        entityId: location.id,
        userId: creatorId,
        newValues: location as any,
      },
    });

    return location;
  }

  async getLocations(query: any) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};

    if (query.type) where.type = query.type;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.location.count({ where }),
    ]);

    return { locations, total, page, limit };
  }

  async getLocationById(id: string) {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            stock: true,
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundError('Lokasi tidak ditemukan');
    }

    return location;
  }

  async updateLocation(id: string, data: UpdateLocationDto, updaterId: string) {
    const existing = await prisma.location.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Lokasi tidak ditemukan');
    }

    const location = await prisma.location.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_LOCATION',
        actionType: 'UPDATE',
        entityType: 'Location',
        entityId: id,
        userId: updaterId,
        oldValues: existing as any,
        newValues: data as any,
      },
    });

    return location;
  }

  async deleteLocation(id: string, deleterId: string) {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, stock: true },
        },
      },
    });

    if (!location) {
      throw new NotFoundError('Lokasi tidak ditemukan');
    }

    if (location._count.users > 0 || location._count.stock > 0) {
      throw new ConflictError('Lokasi tidak dapat dihapus karena masih memiliki data terkait');
    }

    await prisma.location.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_LOCATION',
        actionType: 'DELETE',
        entityType: 'Location',
        entityId: id,
        userId: deleterId,
        oldValues: location as any,
      },
    });

    return { message: 'Lokasi berhasil dihapus' };
  }
}
