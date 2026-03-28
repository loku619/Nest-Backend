import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user with encrypted password
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password } = createUserDto;

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    return new UserResponseDto(savedUser);
  }

  /**
   * Get all users (excluding soft deleted)
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      where: { deleted_at: null } as any,
    //   order: { created_at: 'DESC' },
    });

    return users.map((user) => new UserResponseDto(user));
  }

  /**
   * Get user by ID (excluding soft deleted)
   */
  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, deleted_at: null } as any,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Get user by email (used for authentication)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email, deleted_at: null } as any,
    });
  }

  /**
   * Update user by ID
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.findById(id);

    // Check if updating email to an email that already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Hash new password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    return new UserResponseDto(updatedUser);
  }

  /**
   * Soft delete user (set deleted_at timestamp)
   */
  async softDelete(id: string): Promise<void> {
    const user = await this.findById(id);
    user.deleted_at = new Date();
    await this.usersRepository.save(user);
  }

  /**
   * Hard delete user (permanently remove from database)
   */
  async hardDelete(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
