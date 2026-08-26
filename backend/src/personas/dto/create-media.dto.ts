import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

export class CreateMediaDto {
  @ApiProperty({ enum: ['IMAGE', 'VIDEO'], description: 'Type of media being uploaded' })
  @IsEnum(['IMAGE', 'VIDEO'])
  type!: 'IMAGE' | 'VIDEO';

  @ApiPropertyOptional({ example: 'Portfolio piece: decoupled architecture diagram' })
  @IsOptional()
  @IsString()
  caption?: string;
}