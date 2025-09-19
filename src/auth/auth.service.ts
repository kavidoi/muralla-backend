import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: { email: string; password: string }) {
    // For development, accept specific test credentials
    const validUsers = [
      { email: 'admin@murallacafe.cl', password: 'admin123', name: 'Admin', role: 'admin' },
      { email: 'contacto@murallacafe.cl', password: 'admin123', name: 'Admin', role: 'admin' }
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
    // This would normally check against database
    if (email === 'admin@murallacafe.cl' && password === 'admin123') {
      return { id: '1', email, name: 'Admin', role: 'admin' };
    }
    return null;
  }
}
