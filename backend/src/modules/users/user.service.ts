import { prisma } from '../../database';
import { hashPassword } from '../../core/security';
import { NotFoundError, ConflictError, ForbiddenError } from '../../core/errors';
import { getPaginationParams } from '../../app/utils';

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role: string;
  locationId?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  role?: string;
  locationId?: string;
  isActive?: boolean;
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  role?: string;
  locationId?: string;
  isActive?: boolean;
  isApproved?: boolean;
}

export class UserService {
  async createUser(data: CreateUserDto, creatorId: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('Email sudah terdaftar');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: data.role as any,
        locationId: data.locationId,
        isApproved: true, // Auto approved when created by admin
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        locationId: true,
        location: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
        isActive: true,
        isApproved: true,
        createdAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_USER',
        actionType: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        userId: creatorId,
        newValues: { email: user.email, fullName: user.fullName, role: user.role },
      },
    });

    return user;
  }

  async getUsers(query: ListUsersQuery) {
    const { page, limit, skip } = getPaginationParams(query.page, query.limit);

    const where: any = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.locationId) {
      where.locationId = query.locationId;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.isApproved !== undefined) {
      where.isApproved = query.isApproved;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          locationId: true,
          location: {
            select: {
              id: true,
              code: true,
              name: true,
              type: true,
            },
          },
          isActive: true,
          isApproved: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        locationId: true,
        location: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            address: true,
          },
        },
        isActive: true,
        isApproved: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return user;
  }

  async updateUser(id: string, data: UpdateUserDto, updaterId: string) {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError('User tidak ditemukan');
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        role: data.role as any,
        locationId: data.locationId,
        isActive: data.isActive,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        locationId: true,
        location: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
          },
        },
        isActive: true,
        isApproved: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_USER',
        actionType: 'UPDATE',
        entityType: 'User',
        entityId: id,
        userId: updaterId,
        oldValues: existingUser as any,
        newValues: data as any,
      },
    });

    return user;
  }

  async approveUser(id: string, isApproved: boolean, approverId: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User tidak ditemukan');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isApproved },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isApproved: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: isApproved ? 'APPROVE_USER' : 'REJECT_USER',
        actionType: isApproved ? 'APPROVE' : 'REJECT',
        entityType: 'User',
        entityId: id,
        userId: approverId,
        newValues: { isApproved },
      },
    });

    return updatedUser;
  }

  async deleteUser(id: string, deleterId: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User tidak ditemukan');
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_USER',
        actionType: 'DELETE',
        entityType: 'User',
        entityId: id,
        userId: deleterId,
        oldValues: { email: user.email, fullName: user.fullName },
      },
    });

    return { message: 'User berhasil dihapus' };
  }
}
