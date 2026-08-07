import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async findByPersona(personaId: string) {
    return this.prisma.availability.findMany({
      where: { personaId },
      orderBy: { startTime: 'asc' },
    });
  }

  async create(personaId: string, userId: string, startTime: Date, endTime: Date) {
    const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
    if (!persona) {
      throw new NotFoundException('Persona not found');
    }

    if (persona.userId !== userId) {
      throw new ForbiddenException('You can only add availability to your own persona');
    }

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Availability cannot be in the past');
    }

    // Check for overlapping slots
    const overlapping = await this.prisma.availability.findFirst({
      where: {
        personaId,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlapping) {
      throw new BadRequestException('Availability slot overlaps with an existing slot');
    }

    return this.prisma.availability.create({
      data: {
        personaId,
        startTime,
        endTime,
      },
    });
  }

  async remove(id: string, userId: string) {
    const slot = await this.prisma.availability.findUnique({
      where: { id },
      include: { persona: { select: { userId: true } } },
    });

    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    if (slot.persona.userId !== userId) {
      throw new ForbiddenException('You can only delete your own availability slots');
    }

    if (slot.isBooked) {
      throw new BadRequestException('Cannot delete a booked availability slot');
    }

    await this.prisma.availability.delete({ where: { id } });
    return { message: 'Availability slot deleted' };
  }
}