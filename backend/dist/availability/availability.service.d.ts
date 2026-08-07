import { PrismaService } from '../prisma/prisma.service';
export declare class AvailabilityService {
    private prisma;
    constructor(prisma: PrismaService);
    findByPersona(personaId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        personaId: string;
        isBooked: boolean;
        startTime: Date;
        endTime: Date;
    }[]>;
    create(personaId: string, userId: string, startTime: Date, endTime: Date): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        personaId: string;
        isBooked: boolean;
        startTime: Date;
        endTime: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
