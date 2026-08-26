import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSkillDto {
  @ApiPropertyOptional({ example: 'React.js' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Skill name cannot be empty' })
  name?: string;

  @ApiPropertyOptional({ example: 'Frontend' })
  @IsOptional()
  @IsString()
  category?: string;
}
