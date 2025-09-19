import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class PosSyncService implements OnModuleInit {
    private prisma;
    private readonly logger;
    private api;
    private isEnabled;
    private apiKey;
    private baseUrl;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private initializeApi;
    private createDefaultConfiguration;
    syncBranchReportData(fromDate?: string, toDate?: string): Promise<{
        success: boolean;
        message: string;
        processedTransactions: number;
        createdTransactions: number;
        errors: string[];
    }>;
    scheduledSync(): Promise<void>;
    private getBranchReportData;
    private getReportData;
    syncBranchReportDataPaginated(fromDate?: string, toDate?: string, filters?: {
        locationId?: string;
        serialNumber?: string;
        typeTransaction?: string;
        cardBrand?: string;
        maxPages?: number;
        pageSize?: number;
    }): Promise<{
        success: boolean;
        message: string;
        processedTransactions: number;
        createdTransactions: number;
        errors: string[];
        totalPages: number;
        pagesProcessed: number;
    }>;
    private mapTuuStatusToPrisma;
    testDatabaseInsertion(): Promise<any>;
    private extractBranchData;
    private chunkDateRange;
    private toYmd;
    private cleanupOldData;
    getPosConfiguration(): Promise<any>;
    updatePosConfiguration(data: {
        apiKey?: string;
        baseUrl?: string;
        autoSyncEnabled?: boolean;
        syncIntervalHours?: number;
        maxDaysToSync?: number;
        retentionDays?: number;
    }): Promise<any>;
    getSyncHistory(limit?: number): Promise<any>;
    getPosTransactions(filters?: {
        startDate?: string;
        endDate?: string;
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        transactions: any;
        total: any;
        limit: number;
        offset: number;
        hasMore: boolean;
    }>;
    getPosTransactionsAdvanced(filters?: {
        startDate?: string;
        endDate?: string;
        status?: string;
        locationId?: string;
        serialNumber?: string;
        merchant?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        transactions: any;
        total: any;
        limit: number;
        offset: number;
        hasMore: boolean;
        analytics: {
            locationBreakdown: any;
            deviceBreakdown: any;
        };
    }>;
}
