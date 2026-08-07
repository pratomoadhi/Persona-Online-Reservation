import { ReservationsService } from './reservations.service';
declare class CreateReservationDto {
    personaId: string;
    availabilityId: string;
    notes?: string;
}
declare class UpdateStatusDto {
    status: string;
}
export declare class ReservationsController {
    private reservationsService;
    constructor(reservationsService: ReservationsService);
    create(userId: string, dto: CreateReservationDto): Promise<{
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
    updateStatus(id: string, userId: string, dto: UpdateStatusDto): Promise<{
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
export {};
