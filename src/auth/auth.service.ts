import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async login(loginDto: { email: string; password: string }) {
    // Use environment variables for authentication - prioritize ConfigService
    const validUsers = [
      {
        email: this.configService.get<string>('ADMIN_EMAIL') || 'contacto@murallacafe.cl',
        password: this.configService.get<string>('ADMIN_PASSWORD') || 'admin123',
        name: this.configService.get<string>('ADMIN_USER') || 'Admin',
        role: 'admin'
      },
      {
        email: this.configService.get<string>('SECONDARY_ADMIN_EMAIL') || 'kavi@murallacafe.cl',
        password: this.configService.get<string>('SECONDARY_ADMIN_PASSWORD') || 'admin123',
        name: this.configService.get<string>('SECONDARY_ADMIN_USER') || 'Kaví Doi',
        role: 'admin'
      },
      {
        email: this.configService.get<string>('TERTIARY_ADMIN_EMAIL') || 'darwin@murallacafe.cl',
        password: this.configService.get<string>('TERTIARY_ADMIN_PASSWORD') || 'admin123',
        name: this.configService.get<string>('TERTIARY_ADMIN_USER') || 'Darwin Bruna',
        role: 'admin'
      }
    ];

    const user = validUsers.find(u =>
      u.email === loginDto.email && u.password === loginDto.password
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: '1',
      email: user.email,
      name: user.name,
      role: user.role
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: '1',
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    // Check against environment variables using ConfigService
    const validUsers = [
      {
        email: this.configService.get<string>('ADMIN_EMAIL') || 'contacto@murallacafe.cl',
        password: this.configService.get<string>('ADMIN_PASSWORD') || 'admin123',
        name: this.configService.get<string>('ADMIN_USER') || 'Admin',
        role: 'admin'
      },
      {
        email: this.configService.get<string>('SECONDARY_ADMIN_EMAIL') || 'kavi@murallacafe.cl',
        password: this.configService.get<string>('SECONDARY_ADMIN_PASSWORD') || 'admin123',
        name: this.configService.get<string>('SECONDARY_ADMIN_USER') || 'Kaví Doi',
        role: 'admin'
      },
      {
        email: this.configService.get<string>('TERTIARY_ADMIN_EMAIL') || 'darwin@murallacafe.cl',
        password: this.configService.get<string>('TERTIARY_ADMIN_PASSWORD') || 'admin123',
        name: this.configService.get<string>('TERTIARY_ADMIN_USER') || 'Darwin Bruna',
        role: 'admin'
      }
    ];

    const user = validUsers.find(u =>
      u.email === email && u.password === password
    );

    if (user) {
      return { id: '1', email: user.email, name: user.name, role: user.role };
    }
    return null;
  }
}
