import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MercadoPagoModule } from './mercadopago/mercadopago.module';
import { InvoicingModule } from './invoicing/invoicing.module';
import { ApiStubModule } from './api-stub/api-stub.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Don't load from .env files - prioritize Render environment variables
      envFilePath: [],
    }),
    AuthModule,
    UsersModule,
    MercadoPagoModule,
    InvoicingModule,
    ApiStubModule,
  ],
})
export class AppModule {}