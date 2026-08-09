import { IsString, IsOptional, IsNumber, IsArray, IsUUID, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonaDto {
  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  headline!: string;

  @ApiPropertyOptional({ example: '10+ years of experience in building scalable systems' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ example: ['uuid1', 'uuid2'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skillIds?: string[];

  @ApiPropertyOptional({
    example: 'uuid-of-user',
    description: 'User ID to create the persona for (Admin only)',
  })
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the persona is verified (Admin only)',
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class UpdatePersonaDto {
  @ApiPropertyOptional({ example: 'Lead Software Engineer' })
  @IsOptional()
  @IsString()
  headline?: string;

  @ApiPropertyOptional({ example: 'Updated bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the persona is verified (Admin only)',
  })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional({
    example: ['uuid1', 'uuid2'],
    description: 'Replace the persona skills (Admin or owner)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skillIds?: string[];
}