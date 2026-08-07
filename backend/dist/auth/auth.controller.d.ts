import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            email: string;
            fullName: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            email: string;
            fullName: string;
            id: string;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.Role;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
