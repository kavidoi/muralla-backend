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
    // Debug: Log environment variables to help troubleshoot
    console.log('🔐 AuthService.login - Environment check:');
    console.log('ADMIN_EMAIL:', this.configService.get<string>('ADMIN_EMAIL'));
    console.log('ADMIN_PASSWORD:', this.configService.get<string>('ADMIN_PASSWORD'));
    console.log('JWT_SECRET available:', !!this.configService.get<string>('JWT_SECRET'));
    console.log('Login attempt:', loginDto.email);

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

    console.log('🔐 Valid users configured:', validUsers.map(u => ({ email: u.email, hasPassword: !!u.password })));

    const user = validUsers.find(u =>
      u.email === loginDto.email && u.password === loginDto.password
    );

    console.log('🔐 User found:', !!user);

    if (!user) {
      console.log('🔐 Login failed - invalid credentials');
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
    console.log('🔐 AuthService.validateUser called with:', email);

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

    console.log('🔐 validateUser - User found:', !!user);

    if (user) {
      return { id: '1', email: user.email, name: user.name, role: user.role };
    }
    return null;
  }
}
