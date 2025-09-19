import { Module } from '@nestjs/common';
import { MercadoPagoController } from './mercadopago.controller';
import { MercadoPagoService } from './mercadopago.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MercadoPagoController],
  providers: [MercadoPagoService, PrismaService],
  exports: [MercadoPagoService],
})
export class MercadoPagoModule {}