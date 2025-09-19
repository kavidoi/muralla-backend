import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Use Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  
  // Global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Enable CORS
  app.enableCors({
    origin: [
      'https://admin.murallacafe.cl',
      'https://muralla-frontend.onrender.com',
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'https://admin.murallacafe.cl'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Muralla backend running on port ${port}`);
  console.log(`🌐 CORS enabled for frontend origins`);
}

bootstrap();
