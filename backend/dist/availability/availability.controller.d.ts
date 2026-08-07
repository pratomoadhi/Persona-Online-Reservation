import { AvailabilityService } from './availability.service';
declare class CreateAvailabilityDto {
    personaId: string;
    startTime: string;
    endTime: string;
}
export declare class AvailabilityController {
    private availabilityService;
    constructor(availabilityService: AvailabilityService);
    findByPersona(personaId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        personaId: string;
        isBooked: boolean;
        startTime: Date;
        endTime: Date;
    }[]>;
    create(personaId: string, userId: string, dto: CreateAvailabilityDto): Promise<{
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
export {};
