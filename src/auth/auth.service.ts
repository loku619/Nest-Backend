import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignJWT, jwtVerify } from 'jose';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private jwtSecret: Uint8Array;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('JWT_SECRET') || 'your-super-secret-key-change-in-production';
    this.jwtSecret = new TextEncoder().encode(secret);
  }

  /**
   * Login user and return JWT token
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.usersService.verifyPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = await this.generateToken(user.id, user.email);
    const decodedToken = await this.verifyToken(token);

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: decodedToken.exp - decodedToken.iat,
      user: new UserResponseDto(user),
    };
  }

  /**
   * Generate JWT token
   */
  async generateToken(userId: string, email: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hour

    const token = await new SignJWT({
      sub: userId,
      email,
    } as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + expiresIn)
      .sign(this.jwtSecret);

    return token;
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const verified = await jwtVerify(token, this.jwtSecret);
      return verified.payload as any as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Get user from JWT token
   */
  async getUserFromToken(token: string): Promise<UserResponseDto> {
    const payload = await this.verifyToken(token);
    const user = await this.usersService.findById(payload.sub);
    return new UserResponseDto(user);
  }
}
