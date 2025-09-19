import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: { email: string; password: string }) {
    // Use environment variables for authentication
    const validUsers = [
      { 
        email: process.env.ADMIN_EMAIL || 'contacto@murallacafe.cl',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        name: process.env.ADMIN_USER || 'Admin',
        role: 'admin'
      },
      {
        email: process.env.SECONDARY_ADMIN_EMAIL || 'kavi@murallacafe.cl',
        password: process.env.SECONDARY_ADMIN_PASSWORD || 'admin123',
        name: process.env.SECONDARY_ADMIN_USER || 'Kaví Doi',
        role: 'admin'
      },
      {
        email: process.env.TERTIARY_ADMIN_EMAIL || 'darwin@murallacafe.cl',
        password: process.env.TERTIARY_ADMIN_PASSWORD || 'admin123',
        name: process.env.TERTIARY_ADMIN_USER || 'Darwin Bruna',
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
    // Check against environment variables
    const validUsers = [
      { 
        email: process.env.ADMIN_EMAIL || 'contacto@murallacafe.cl',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        name: process.env.ADMIN_USER || 'Admin',
        role: 'admin'
      },
      {
        email: process.env.SECONDARY_ADMIN_EMAIL || 'kavi@murallacafe.cl',
        password: process.env.SECONDARY_ADMIN_PASSWORD || 'admin123',
        name: process.env.SECONDARY_ADMIN_USER || 'Kaví Doi',
        role: 'admin'
      },
      {
        email: process.env.TERTIARY_ADMIN_EMAIL || 'darwin@murallacafe.cl',
        password: process.env.TERTIARY_ADMIN_PASSWORD || 'admin123',
        name: process.env.TERTIARY_ADMIN_USER || 'Darwin Bruna',
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
