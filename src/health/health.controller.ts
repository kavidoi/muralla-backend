import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('healthz')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'muralla-backend',
      version: '1.0.0'
    };
  }

  @Get()
  health() {
    return { status: 'healthy' };
  }
}
