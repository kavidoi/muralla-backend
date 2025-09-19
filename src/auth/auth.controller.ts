import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  async getProfile(@Request() req: any) {
    // For now, return a mock user
    return {
      id: '1',
      email: 'admin@murallacafe.cl',
      name: 'Admin',
      role: 'admin'
    };
  }

  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
