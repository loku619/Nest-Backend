import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  first_name?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  last_name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be valid' })
  email?: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;
}
