import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { TestController } from './test.controller';
import { InvoicingController } from './invoicing/invoicing.controller';
import { InvoicingService } from './invoicing/invoicing.service';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { ApiStubModule } from './api-stub/api-stub.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ApiStubModule,
  ],
  controllers: [TestController, InvoicingController, HealthController],
  providers: [PrismaService, InvoicingService],
})
export class AppModule {}