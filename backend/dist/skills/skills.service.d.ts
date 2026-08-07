import { PrismaService } from '../prisma/prisma.service';
export declare class SkillsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        category: string | null;
    }[]>;
    create(name: string, category?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        category: string | null;
    }>;
}
