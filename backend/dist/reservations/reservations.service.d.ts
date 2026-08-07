import { PrismaService } from '../prisma/prisma.service';
export declare class ReservationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, personaId: string, availabilityId: string, notes?: string): Promise<{
        persona: {
            user: {
                fullName: string;
                avatarUrl: string | null;
            };
            id: string;
            headline: string;
        };
        availability: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            personaId: string;
            isBooked: boolean;
            startTime: Date;
            endTime: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        personaId: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        notes: string | null;
        availabilityId: string;
    }>;
    findMine(userId: string, status?: string, page?: number, limit?: number): Promise<{
        items: ({
            persona: {
                user: {
                    fullName: string;
                    avatarUrl: string | null;
                };
                id: string;
                headline: string;
            };
            availability: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                personaId: string;
                isBooked: boolean;
                startTime: Date;
                endTime: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            personaId: string;
            status: import(".prisma/client").$Enums.ReservationStatus;
            notes: string | null;
            availabilityId: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<{
        user: {
            email: string;
            fullName: string;
            id: string;
            avatarUrl: string | null;
        };
        persona: {
            user: {
                fullName: string;
                avatarUrl: string | null;
            };
            id: string;
            userId: string;
            headline: string;
        };
        availability: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            personaId: string;
            isBooked: boolean;
            startTime: Date;
            endTime: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        personaId: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        notes: string | null;
        availabilityId: string;
    }>;
    updateStatus(id: string, userId: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        personaId: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        notes: string | null;
        availabilityId: string;
    }>;
    cancel(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        personaId: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        notes: string | null;
        availabilityId: string;
    }>;
}
