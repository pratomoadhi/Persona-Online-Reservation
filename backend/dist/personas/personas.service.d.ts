import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonaDto, UpdatePersonaDto } from './dto/create-persona.dto';
export declare class PersonasService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(search?: string, skill?: string, page?: number, limit?: number): Promise<{
        items: {
            id: string;
            headline: string;
            bio: string | null;
            hourlyRate: number | null;
            rating: number;
            ratingCount: number;
            isVerified: boolean;
            user: {
                fullName: string;
                id: string;
                avatarUrl: string | null;
            };
            skills: {
                id: string;
                name: string;
                category: string | null;
            }[];
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<{
        skills: {
            level: import(".prisma/client").$Enums.SkillLevel;
            id: string;
            name: string;
            category: string | null;
        }[];
        user: {
            fullName: string;
            id: string;
            avatarUrl: string | null;
        };
        availability: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            personaId: string;
            isBooked: boolean;
            startTime: Date;
            endTime: Date;
        }[];
        id: string;
        isVerified: boolean;
        createdAt: Date;
        headline: string;
        bio: string | null;
        hourlyRate: number | null;
        rating: number;
        ratingCount: number;
    }>;
    create(userId: string, dto: CreatePersonaDto): Promise<{
        skills: {
            level: import(".prisma/client").$Enums.SkillLevel;
            id: string;
            name: string;
            category: string | null;
        }[];
        user: {
            fullName: string;
            id: string;
            avatarUrl: string | null;
        };
        availability: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            personaId: string;
            isBooked: boolean;
            startTime: Date;
            endTime: Date;
        }[];
        id: string;
        isVerified: boolean;
        createdAt: Date;
        headline: string;
        bio: string | null;
        hourlyRate: number | null;
        rating: number;
        ratingCount: number;
    }>;
    update(id: string, userId: string, dto: UpdatePersonaDto): Promise<{
        id: string;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        headline: string;
        bio: string | null;
        hourlyRate: number | null;
        rating: number;
        ratingCount: number;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
}
