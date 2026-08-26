import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ example: 'React' })
  @IsString()
  @MinLength(1, { message: 'Skill name is required' })
  name!: string;

  @ApiPropertyOptional({ example: 'Frontend' })
  @IsOptional()
  @IsString()
  category?: string;
}
