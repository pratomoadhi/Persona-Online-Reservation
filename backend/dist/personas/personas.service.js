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
exports.PersonasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PersonasService = class PersonasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search, skill, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = {
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
                        select: { id: true, fullName: true, avatarUrl: true },
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
    async findById(id) {
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
                    select: { id: true, fullName: true, avatarUrl: true },
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
            throw new common_1.NotFoundException('Persona not found');
        }
        return {
            ...persona,
            skills: persona.skills.map((s) => ({ ...s.skill, level: s.level })),
        };
    }
    async create(userId, dto) {
        const existing = await this.prisma.persona.findUnique({ where: { userId } });
        if (existing) {
            throw new common_1.ConflictException('User already has a persona profile');
        }
        const persona = await this.prisma.persona.create({
            data: {
                userId,
                headline: dto.headline,
                bio: dto.bio,
                hourlyRate: dto.hourlyRate,
                skills: dto.skillIds
                    ? {
                        create: dto.skillIds.map((skillId) => ({ skillId })),
                    }
                    : undefined,
            },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { role: 'PERSONA' },
        });
        return this.findById(persona.id);
    }
    async update(id, userId, dto) {
        const persona = await this.prisma.persona.findUnique({ where: { id } });
        if (!persona) {
            throw new common_1.NotFoundException('Persona not found');
        }
        if (persona.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own persona');
        }
        return this.prisma.persona.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id, userId) {
        const persona = await this.prisma.persona.findUnique({ where: { id } });
        if (!persona) {
            throw new common_1.NotFoundException('Persona not found');
        }
        if (persona.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own persona');
        }
        await this.prisma.persona.delete({ where: { id } });
        await this.prisma.user.update({
            where: { id: userId },
            data: { role: 'USER' },
        });
        return { message: 'Persona deleted' };
    }
};
exports.PersonasService = PersonasService;
exports.PersonasService = PersonasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PersonasService);
//# sourceMappingURL=personas.service.js.map