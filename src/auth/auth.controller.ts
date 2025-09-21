import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    console.log('🔐 AuthController.login called');
    console.log('🔐 authService exists:', !!this.authService);
    console.log('🔐 loginDto:', loginDto);
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
