import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { rm } from 'fs/promises';
import { randomBytes } from 'crypto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const ALLOWED_AVATAR_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

const avatarFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (ALLOWED_AVATAR_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Unsupported file type. Allowed: jpeg/png/gif/webp/bmp'), false);
  }
};

const avatarStorage = diskStorage({
  destination: (req, _file, cb) => {
    const userId = (req as unknown as { user: { id: string } }).user.id;
    const dir = join(process.cwd(), 'uploads', 'avatars', userId);
    mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomBytes(4).toString('hex')}${ext}`);
  },
});

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(userId, dto);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Upload a profile picture for the current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: avatarStorage,
      fileFilter: avatarFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const avatarUrl = `/uploads/avatars/${userId}/${file.filename}`;

    // Remove the previous avatar file (only if it was uploaded through this endpoint)
    const previous = await this.usersService.getAvatarUrl(userId);
    const updated = await this.usersService.updateAvatar(userId, avatarUrl);

    if (previous && previous.startsWith('/uploads/avatars/')) {
      const previousPath = join(process.cwd(), previous.replace(/^\/+/, ''));
      await rm(previousPath, { force: true }).catch(() => undefined);
    }

    return updated;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  async findAll(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }
}