import { SkillsService } from './skills.service';
declare class CreateSkillDto {
    name: string;
    category?: string;
}
export declare class SkillsController {
    private skillsService;
    constructor(skillsService: SkillsService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        category: string | null;
    }[]>;
    create(dto: CreateSkillDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        category: string | null;
    }>;
}
export {};
