import { Module } from '@nestjs/common';
import { ApiStubController } from './api-stub.controller';

@Module({
  controllers: [ApiStubController],
})
export class ApiStubModule {}
