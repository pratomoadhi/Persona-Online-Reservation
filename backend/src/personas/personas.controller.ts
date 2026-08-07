import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PersonasService } from './personas.service';
import { CreatePersonaDto, UpdatePersonaDto } from './dto/create-persona.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a persona profile' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreatePersonaDto) {
    return this.personasService.create(userId, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a persona profile' })
  async update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: UpdatePersonaDto) {
    return this.personasService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a persona profile' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.personasService.remove(id, userId);
  }
}