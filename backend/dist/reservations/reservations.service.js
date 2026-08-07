"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReservationsService = class ReservationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, personaId, availabilityId, notes) {
        const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
        if (!persona) {
            throw new common_1.NotFoundException('Persona not found');
        }
        if (persona.userId === userId) {
            throw new common_1.BadRequestException('You cannot book your own persona');
        }
        const slot = await this.prisma.availability.findUnique({
            where: { id: availabilityId },
        });
        if (!slot) {
            throw new common_1.NotFoundException('Availability slot not found');
        }
        if (slot.personaId !== personaId) {
            throw new common_1.BadRequestException('Availability slot does not belong to this persona');
        }
        if (slot.isBooked) {
            throw new common_1.BadRequestException('This slot is already booked');
        }
        if (slot.startTime < new Date()) {
            throw new common_1.BadRequestException('This slot has already passed');
        }
        const reservation = await this.prisma.$transaction(async (tx) => {
            const currentSlot = await tx.availability.findUnique({
                where: { id: availabilityId },
            });
            if (!currentSlot || currentSlot.isBooked) {
                throw new common_1.BadRequestException('This slot is already booked');
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
    async findMine(userId, status, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = {
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
    async findById(id) {
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
            throw new common_1.NotFoundException('Reservation not found');
        }
        return reservation;
    }
    async updateStatus(id, userId, status) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: { persona: { select: { userId: true } } },
        });
        if (!reservation) {
            throw new common_1.NotFoundException('Reservation not found');
        }
        if (reservation.persona.userId !== userId) {
            throw new common_1.ForbiddenException('Only the persona can update reservation status');
        }
        if (reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED') {
            throw new common_1.BadRequestException(`Cannot update a ${reservation.status.toLowerCase()} reservation`);
        }
        const validTransitions = {
            PENDING: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['COMPLETED', 'CANCELLED'],
        };
        if (!validTransitions[reservation.status]?.includes(status)) {
            throw new common_1.BadRequestException(`Cannot transition from ${reservation.status} to ${status}`);
        }
        return this.prisma.reservation.update({
            where: { id },
            data: { status: status },
        });
    }
    async cancel(id, userId) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: { persona: { select: { userId: true } } },
        });
        if (!reservation) {
            throw new common_1.NotFoundException('Reservation not found');
        }
        if (reservation.userId !== userId && reservation.persona.userId !== userId) {
            throw new common_1.ForbiddenException('You can only cancel your own reservations');
        }
        if (reservation.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot cancel a completed reservation');
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
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map