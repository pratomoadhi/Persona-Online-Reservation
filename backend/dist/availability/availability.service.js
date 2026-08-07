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
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AvailabilityService = class AvailabilityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByPersona(personaId) {
        return this.prisma.availability.findMany({
            where: { personaId },
            orderBy: { startTime: 'asc' },
        });
    }
    async create(personaId, userId, startTime, endTime) {
        const persona = await this.prisma.persona.findUnique({ where: { id: personaId } });
        if (!persona) {
            throw new common_1.NotFoundException('Persona not found');
        }
        if (persona.userId !== userId) {
            throw new common_1.ForbiddenException('You can only add availability to your own persona');
        }
        if (endTime <= startTime) {
            throw new common_1.BadRequestException('End time must be after start time');
        }
        if (startTime < new Date()) {
            throw new common_1.BadRequestException('Availability cannot be in the past');
        }
        const overlapping = await this.prisma.availability.findFirst({
            where: {
                personaId,
                startTime: { lt: endTime },
                endTime: { gt: startTime },
            },
        });
        if (overlapping) {
            throw new common_1.BadRequestException('Availability slot overlaps with an existing slot');
        }
        return this.prisma.availability.create({
            data: {
                personaId,
                startTime,
                endTime,
            },
        });
    }
    async remove(id, userId) {
        const slot = await this.prisma.availability.findUnique({
            where: { id },
            include: { persona: { select: { userId: true } } },
        });
        if (!slot) {
            throw new common_1.NotFoundException('Availability slot not found');
        }
        if (slot.persona.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own availability slots');
        }
        if (slot.isBooked) {
            throw new common_1.BadRequestException('Cannot delete a booked availability slot');
        }
        await this.prisma.availability.delete({ where: { id } });
        return { message: 'Availability slot deleted' };
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map