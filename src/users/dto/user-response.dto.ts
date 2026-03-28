import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'User last modification timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  modified_at: Date;

  @Exclude()
  password: string;

  @Exclude()
  deleted_at: Date | null;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
