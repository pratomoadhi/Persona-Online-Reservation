import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @ApiProperty({ example: 'securepassword' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @ApiProperty({ example: 'New User' })
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({ example: 'PERSONA', enum: ['USER', 'PERSONA', 'ADMIN'] })
  @IsOptional()
  @IsEnum(['USER', 'PERSONA', 'ADMIN'])
  role?: 'USER' | 'PERSONA' | 'ADMIN';
}