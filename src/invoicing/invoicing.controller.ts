import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { InvoicingService } from './invoicing.service';

@Controller('invoicing')
export class InvoicingController {
  constructor(private readonly invoicingService: InvoicingService) {}

  @Get('documents')
  async getDocuments(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    // For now, return empty array to prevent 404
    return {
      documents: [],
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: 0,
        totalPages: 0,
      },
    };
  }

  @Get('tax-documents')
  async getTaxDocuments(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    console.log('Controller method called, service is:', this.invoicingService);
    if (!this.invoicingService) {
      throw new Error('InvoicingService is not injected properly');
    }
    return this.invoicingService.getTaxDocuments(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('tax-documents/stats')
  async getTaxDocumentStats() {
    return this.invoicingService.getTaxDocumentStats();
  }

  @Get('tax-documents/:id')
  async getTaxDocumentById(@Param('id') id: string) {
    return this.invoicingService.getTaxDocumentById(id);
  }
}