import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PersonasService } from './personas.service';
import { CreatePersonaDto, UpdatePersonaDto } from './dto/create-persona.dto';
import { VerifyPersonaDto } from './dto/verify-persona.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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
}