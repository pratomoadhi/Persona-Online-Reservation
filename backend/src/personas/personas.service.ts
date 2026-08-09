import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonaDto, UpdatePersonaDto } from './dto/create-persona.dto';

@Injectable()
export class PersonasService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, skill?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where: any = {
      ...(search && {
        OR: [
          { headline: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
          { user: { fullName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...(skill && {
        skills: {
          some: {
            skill: { name: { contains: skill, mode: 'insensitive' } },
          },
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.persona.findMany({
        where,
        skip,
        take: limit,
        orderBy: { rating: 'desc' },
        select: {
          id: true,
          headline: true,
          bio: true,
          hourlyRate: true,
          rating: true,
          ratingCount: true,
          isVerified: true,
          user: {
            select: { id: true, fullName: true, avatarUrl: true, email: true },
          },
          skills: {
            select: {
              skill: { select: { id: true, name: true, category: true } },
            },
          },
        },
      }),
      this.prisma.persona.count({ where }),
    ]);

    return {
      items: items.map((p) => ({
        id: p.id,
        headline: p.headline,
        bio: p.bio,
        hourlyRate: p.hourlyRate,
        rating: p.rating,
        ratingCount: p.ratingCount,
        isVerified: p.isVerified,
        user: p.user,
        skills: p.skills.map((s) => s.skill),
      })),
      total,
      page,
      limit,
    };
  }

  async findById(id: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      select: {
        id: true,
        headline: true,
        bio: true,
        hourlyRate: true,
        rating: true,
        ratingCount: true,
        isVerified: true,
        createdAt: true,
        user: {
          select: { id: true, fullName: true, avatarUrl: true, email: true },
        },
        skills: {
          select: {
            level: true,
            skill: { select: { id: true, name: true, category: true } },
          },
        },
        availability: {
          where: { isBooked: false, startTime: { gt: new Date() } },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    return {
      ...persona,
      skills: persona.skills.map((s) => ({ ...s.skill, level: s.level })),
    };
  }

  async create(userId: string, dto: CreatePersonaDto, isAdmin = false) {
    // Admin can specify a target userId; regular users create for themselves
    const targetUserId = isAdmin && dto.userId ? dto.userId : userId;

    // For non-admin users, prevent role escalation attempts
    if (!isAdmin && dto.userId) {
      throw new ForbiddenException('Only admins can assign personas to other users');
    }

    // Validate the target user exists
    const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      throw new NotFoundException('User not found. Cannot create a persona for a non-existent user.');
    }

    const existing = await this.prisma.persona.findUnique({ where: { userId: targetUserId } });
    if (existing) {
      throw new ConflictException('User already has a persona profile');
    }

    const persona = await this.prisma.persona.create({
      data: {
        userId: targetUserId,
        headline: dto.headline,
        bio: dto.bio,
        hourlyRate: dto.hourlyRate,
        isVerified: isAdmin ? (dto.isVerified ?? false) : false,
        skills: dto.skillIds
          ? {
              create: dto.skillIds.map((skillId) => ({ skillId })),
            }
          : undefined,
      },
    });

    // Update user role to PERSONA
    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: 'PERSONA' },
    });

    return this.findById(persona.id);
  }

  async update(id: string, userId: string, dto: UpdatePersonaDto, isAdmin = false) {
    const persona = await this.prisma.persona.findUnique({
      where: { id },
      include: { skills: true },
    });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    // Owner can update own persona; admin can update any persona
    if (persona.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only update your own persona');
    }

    // Non-admin users cannot change verification status
    if (!isAdmin && dto.isVerified !== undefined) {
      throw new ForbiddenException('Only admins can change verification status');
    }

    const data: any = {
      ...(dto.headline !== undefined && { headline: dto.headline }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.hourlyRate !== undefined && { hourlyRate: dto.hourlyRate }),
      ...(isAdmin && dto.isVerified !== undefined && { isVerified: dto.isVerified }),
    };

    // Handle skill replacement if skillIds provided
    if (dto.skillIds) {
      // Delete existing skills and create new ones
      await this.prisma.personaSkill.deleteMany({ where: { personaId: id } });
      data.skills = {
        create: dto.skillIds.map((skillId) => ({ skillId })),
      };
    }

    await this.prisma.persona.update({
      where: { id },
      data,
    });

    return this.findById(id);
  }

  async remove(id: string, userId: string, isAdmin = false) {
    const persona = await this.prisma.persona.findUnique({ where: { id } });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    // Owner can delete own persona; admin can delete any persona
    if (persona.userId !== userId && !isAdmin) {
      throw new ForbiddenException('You can only delete your own persona');
    }

    await this.prisma.persona.delete({ where: { id } });

    // Update user role back to USER
    await this.prisma.user.update({
      where: { id: persona.userId },
      data: { role: 'USER' },
    });

    return { message: 'Persona deleted' };
  }

  async verify(id: string, isVerified: boolean) {
    const persona = await this.prisma.persona.findUnique({ where: { id } });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    return this.prisma.persona.update({
      where: { id },
      data: { isVerified },
    });
  }
}