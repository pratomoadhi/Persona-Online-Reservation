import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class CreateReservationDto {
  personaId!: string;
  availabilityId!: string;
  notes?: string;
}

class UpdateStatusDto {
  status!: string;
}

@ApiTags('Reservations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a reservation' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(userId, dto.personaId, dto.availabilityId, dto.notes);
  }

  @Get('me')
  @ApiOperation({ summary: 'List my reservations' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findMine(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.reservationsService.findMine(userId, status, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by ID' })
  async findById(@Param('id') id: string) {
    return this.reservationsService.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update reservation status' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.reservationsService.updateStatus(id, userId, dto.status);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a reservation' })
  async cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.reservationsService.cancel(id, userId);
  }
}