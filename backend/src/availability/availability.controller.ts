import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class CreateAvailabilityDto {
  personaId!: string;
  startTime!: string;
  endTime!: string;
}

@ApiTags('Availability')
@Controller()
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get('personas/:personaId/availability')
  @ApiOperation({ summary: 'List availability for a persona' })
  async findByPersona(@Param('personaId') personaId: string) {
    return this.availabilityService.findByPersona(personaId);
  }

  @Post('personas/:personaId/availability')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create an availability slot' })
  async create(
    @Param('personaId') personaId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.create(
      personaId,
      userId,
      new Date(dto.startTime),
      new Date(dto.endTime),
    );
  }

  @Delete('availability/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an availability slot' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.availabilityService.remove(id, userId);
  }
}