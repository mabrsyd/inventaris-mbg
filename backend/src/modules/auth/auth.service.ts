import { prisma } from '../../database';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../core/security';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../core/errors';

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  locationId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {
  async register(data: RegisterDto) {
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
        role: data.role as any || 'WAREHOUSE_STAFF',
        locationId: data.locationId,
        isApproved: false,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        locationId: true,
        isActive: true,
        isApproved: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('Email atau password salah');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Akun tidak aktif');
    }

    if (!user.isApproved) {
      throw new UnauthorizedError('Akun belum disetujui oleh admin');
    }

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Email atau password salah');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      locationId: user.locationId || undefined,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        actionType: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        userId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        locationId: user.locationId,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken || storedToken.revokedAt) {
        throw new UnauthorizedError('Refresh token tidak valid');
      }

      if (storedToken.expiresAt < new Date()) {
        throw new UnauthorizedError('Refresh token telah expired');
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive || !user.isApproved) {
        throw new UnauthorizedError('User tidak valid');
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        locationId: user.locationId || undefined,
      };

      const accessToken = generateAccessToken(tokenPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError('Refresh token tidak valid');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: {
          token: refreshToken,
          userId,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'LOGOUT',
        actionType: 'LOGOUT',
        entityType: 'User',
        entityId: userId,
        userId,
      },
    });

    return { message: 'Logout berhasil' };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
    });

    if (!user) {
      throw new UnauthorizedError('User tidak ditemukan');
    }

    return user;
  }
}
