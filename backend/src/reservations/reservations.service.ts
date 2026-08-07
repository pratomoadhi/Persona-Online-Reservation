import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, personaId: string, availabilityId: string, notes?: string) {
    // Check if persona exists
    const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    // Check if user is trying to book their own persona
    if (persona.userId === userId) {
      throw new BadRequestException('You cannot book your own persona');
    }

    // Check availability slot
    const slot = await this.prisma.availability.findUnique({
      where: { id: availabilityId },
    });
    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    if (slot.personaId !== personaId) {
      throw new BadRequestException('Availability slot does not belong to this persona');
    }

    if (slot.isBooked) {
      throw new BadRequestException('This slot is already booked');
    }

    if (slot.startTime < new Date()) {
      throw new BadRequestException('This slot has already passed');
    }

    // Create reservation and mark slot as booked in a transaction
    const reservation = await this.prisma.$transaction(async (tx) => {
      // Double-check the slot is not booked (concurrency protection)
      const currentSlot = await tx.availability.findUnique({
        where: { id: availabilityId },
      });
      if (!currentSlot || currentSlot.isBooked) {
        throw new BadRequestException('This slot is already booked');
      }

      const created = await tx.reservation.create({
        data: {
          userId,
          personaId,
          availabilityId,
          notes,
        },
        include: {
          persona: {
            select: {
              id: true,
              headline: true,
              user: { select: { fullName: true, avatarUrl: true } },
            },
          },
          availability: true,
        },
      });

      await tx.availability.update({
        where: { id: availabilityId },
        data: { isBooked: true },
      });

      // Create notification for the persona
      await tx.notification.create({
        data: {
          userId: persona.userId,
          type: 'BOOKING',
          title: 'New booking request',
          body: `A user requested a consultation on ${slot.startTime.toLocaleString()}`,
        },
      });

      return created;
    });

    return reservation;
  }

  async findMine(userId: string, status?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = {
      userId,
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          persona: {
            select: {
              id: true,
              headline: true,
              user: { select: { fullName: true, avatarUrl: true } },
            },
          },
          availability: true,
        },
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        persona: {
          select: {
            id: true,
            headline: true,
            userId: true,
            user: { select: { fullName: true, avatarUrl: true } },
          },
        },
        availability: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async updateStatus(id: string, userId: string, status: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { persona: { select: { userId: true } } },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.persona.userId !== userId) {
      throw new ForbiddenException('Only the persona can update reservation status');
    }

    if (reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot update a ${reservation.status.toLowerCase()} reservation`);
    }

    const validTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    if (!validTransitions[reservation.status]?.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${reservation.status} to ${status}`);
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async cancel(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { persona: { select: { userId: true } } },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.userId !== userId && reservation.persona.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own reservations');
    }

    if (reservation.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel a completed reservation');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.reservation.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      await tx.availability.update({
        where: { id: reservation.availabilityId },
        data: { isBooked: false },
      });

      return result;
    });

    return updated;
  }
}