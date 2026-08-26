import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, DefaultValuePipe, ParseIntPipe, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { rm } from 'fs/promises';
import { randomBytes } from 'crypto';
import { PersonasService } from './personas.service';
import { CreatePersonaDto, UpdatePersonaDto } from './dto/create-persona.dto';
import { VerifyPersonaDto } from './dto/verify-persona.dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const ALLOWED_MEDIA_MIME = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
];

const mediaFileFilter = (_req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
  if (ALLOWED_MEDIA_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('Unsupported file type. Allowed: images (jpeg/png/gif/webp/bmp) and videos (mp4/webm/mov/avi)'), false);
  }
};

const mediaStorage = diskStorage({
  destination: (req, _file, cb) => {
    const personaId = (req.params as { id: string }).id;
    const dir = join(process.cwd(), 'uploads', 'personas', personaId);
    mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomBytes(4).toString('hex')}${ext}`);
  },
});

@ApiTags('Personas')
@Controller('personas')
export class PersonasController {
  constructor(private personasService: PersonasService) {}

  @Get()
  @ApiOperation({ summary: 'List personas with search and filtering' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'skill', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('skill') skill?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.personasService.findAll(search, skill, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get persona by ID' })
  async findById(@Param('id') id: string) {
    return this.personasService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Create a persona profile (Admin can create for any user)' })
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreatePersonaDto,
  ) {
    return this.personasService.create(userId, dto, role === 'ADMIN');
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update a persona profile (Owner or Admin)' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdatePersonaDto,
  ) {
    return this.personasService.update(id, userId, dto, role === 'ADMIN');
  }

  @Delete('media/:mediaId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a persona media item (Admin only)' })
  async removeMedia(@Param('mediaId') mediaId: string) {
    return this.personasService.removeMedia(mediaId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Delete a persona profile (Owner or Admin)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.personasService.remove(id, userId, role === 'ADMIN');
  }

  @Patch(':id/verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Verify or unverify a persona profile (Admin only)' })
  async verify(
    @Param('id') id: string,
    @Body() dto: VerifyPersonaDto,
  ) {
    return this.personasService.verify(id, dto.isVerified);
  }

  @Post(':id/media')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Upload a photo or video for a persona (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', enum: ['IMAGE', 'VIDEO'] },
        caption: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: mediaStorage,
      fileFilter: mediaFileFilter,
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadMedia(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateMediaDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const actualType = file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE';
    if (dto.type !== actualType) {
      await rm(file.path, { force: true }).catch(() => undefined);
      throw new BadRequestException(
        `Selected type is ${dto.type} but the uploaded file is ${actualType.toLowerCase()}`,
      );
    }

    const url = `/uploads/personas/${id}/${file.filename}`;
    return this.personasService.addMedia(id, dto.type, url, dto.caption);
  }
}