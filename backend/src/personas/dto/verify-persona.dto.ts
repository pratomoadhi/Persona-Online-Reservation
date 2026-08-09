import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPersonaDto {
  @ApiProperty({ example: true, description: 'Verify or unverify the persona' })
  @IsBoolean()
  isVerified!: boolean;
}