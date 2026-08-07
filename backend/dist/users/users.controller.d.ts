import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(userId: string): Promise<{
        persona: {
            id: string;
            isVerified: boolean;
            headline: string;
        } | null;
        email: string;
        fullName: string;
        id: string;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        isVerified: boolean;
        createdAt: Date;
    }>;
    updateMe(userId: string, dto: UpdateUserDto): Promise<{
        email: string;
        fullName: string;
        id: string;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        isVerified: boolean;
        createdAt: Date;
    }>;
}
