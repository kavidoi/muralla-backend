"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PosSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PosSyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = require("axios");
let PosSyncService = PosSyncService_1 = class PosSyncService {
    prisma;
    logger = new common_1.Logger(PosSyncService_1.name);
    api;
    isEnabled = false;
    apiKey;
    baseUrl;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.initializeApi();
        }
        catch (error) {
            this.logger.error('Failed to initialize POS service:', error);
        }
    }
    async initializeApi() {
        try {
            if (!this.prisma) {
                this.logger.error('PrismaService not available during initialization');
                return;
            }
            const config = await this.getPosConfiguration();
            if (config) {
                this.apiKey = config.apiKey || process.env.TUU_API_KEY;
                this.baseUrl = config.baseUrl || 'https://integrations.payment.haulmer.com';
                this.isEnabled = config.autoSyncEnabled && !!this.apiKey;
            }
            else {
                try {
                    await this.createDefaultConfiguration();
                }
                catch (error) {
                    this.logger.error('Failed to create default configuration:', error);
                }
            }
            if (this.apiKey) {
                this.api = axios_1.default.create({
                    baseURL: this.baseUrl,
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    timeout: 30000,
                });
                this.api.interceptors.request.use((config) => {
                    this.logger.log(`Tuu API Request: ${config.method?.toUpperCase()} ${config.url}`);
                    return config;
                }, (error) => {
                    this.logger.error('Tuu API Request Error:', error.message);
                    return Promise.reject(error);
                });
                this.api.interceptors.response.use((response) => {
                    this.logger.log(`Tuu API Response: ${response.status} - ${response.data?.message || 'Success'}`);
                    return response;
                }, (error) => {
                    this.logger.error('Tuu API Response Error:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        message: error.message,
                    });
                    return Promise.reject(error);
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to initialize POS API:', error);
        }
    }
    async createDefaultConfiguration() {
        try {
            await this.prisma.pOSConfiguration.create({
                data: {
                    apiKey: process.env.TUU_API_KEY,
                    baseUrl: 'https://integrations.payment.haulmer.com',
                    autoSyncEnabled: true,
                    syncIntervalHours: 24,
                    maxDaysToSync: 60,
                    retentionDays: 365,
                    tenantId: null,
                }
            });
            this.logger.log('Created default POS configuration');
        }
        catch (error) {
            this.logger.error('Failed to create default POS configuration:', error);
            this.logger.warn('POS configuration table may not exist. Check if migrations were applied.');
        }
    }
    async syncBranchReportData(fromDate, toDate) {
        const syncId = `sync_${Date.now()}`;
        const startTime = new Date();
        const errors = [];
        let processedTransactions = 0;
        let createdTransactions = 0;
        try {
            if (!this.isEnabled) {
                const message = 'POS sync is disabled or not configured properly';
                this.logger.warn(message);
                return {
                    success: false,
                    message,
                    processedTransactions: 0,
                    createdTransactions: 0,
                    errors: [message]
                };
            }
            const endDate = (toDate && toDate.match(/^\d{4}-\d{2}-\d{2}$/)) ? toDate : new Date().toISOString().split('T')[0];
            const startDate = (fromDate && fromDate.match(/^\d{4}-\d{2}-\d{2}$/)) ? fromDate : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const startMs = Date.parse(startDate);
            const endMs = Date.parse(endDate);
            const baseRange = startMs > endMs ? { from: endDate, to: startDate } : { from: startDate, to: endDate };
            this.logger.log(`Starting POS sync for date range: ${baseRange.from} to ${baseRange.to}`);
            const prismaAny = this.prisma;
            const syncLog = await prismaAny.pOSSyncLog.create({
                data: {
                    syncType: 'MANUAL',
                    status: 'RUNNING',
                    startDate: new Date(startDate + 'T00:00:00.000Z'),
                    endDate: new Date(endDate + 'T23:59:59.999Z'),
                    startedAt: new Date(),
                    apiEndpoint: '/BranchReport/branch-report',
                    tenantId: null
                }
            });
            try {
                const chunks = this.chunkDateRange(baseRange.from, baseRange.to, 30);
                let lastBranchReportResponse = null;
                let anyData = false;
                for (const chunk of chunks) {
                    const branchReportResponse = await this.getBranchReportData({
                        from: chunk.from,
                        to: chunk.to
                    });
                    lastBranchReportResponse = branchReportResponse;
                    const branches = this.extractBranchData(branchReportResponse);
                    if (!branches.length) {
                        this.logger.warn(`No data received from Tuu API for range ${chunk.from} to ${chunk.to}`);
                        continue;
                    }
                    anyData = true;
                    this.logger.debug('Raw API Response structure:', {
                        hasData: !!branchReportResponse,
                        dataKeys: branchReportResponse ? Object.keys(branchReportResponse) : [],
                        branchCount: branches.length,
                        firstBranch: branches[0] ? {
                            keys: Object.keys(branches[0]),
                            location: branches[0].location,
                            merchant: branches[0].merchant,
                            salesCount: Array.isArray(branches[0].sales) ? branches[0].sales.length : 0
                        } : null
                    });
                    this.logger.debug('Full API Response (first 500 chars):', JSON.stringify(branchReportResponse).substring(0, 500));
                    for (const branchData of branches) {
                        const sales = Array.isArray(branchData.sales) ? branchData.sales : [];
                        if (sales.length > 0) {
                            this.logger.debug('First sale structure:', {
                                saleKeys: Object.keys(sales[0]),
                                saleData: {
                                    id: sales[0].id,
                                    status: sales[0].status,
                                    transactionDateTime: sales[0].transactionDateTime,
                                    transactionType: sales[0].transactionType,
                                    saleAmount: sales[0].saleAmount,
                                    totalAmount: sales[0].totalAmount,
                                    sequenceNumber: sales[0].sequenceNumber,
                                    serialNumber: sales[0].serialNumber,
                                    itemsCount: sales[0].items ? sales[0].items.length : 0
                                }
                            });
                        }
                        for (const sale of sales) {
                            try {
                                processedTransactions++;
                                let transactionId = sale.id;
                                if (!transactionId || transactionId === undefined || transactionId === null || transactionId === '') {
                                    transactionId = sale.transactionId || sale.saleId || sale.tuuSaleId;
                                    if (!transactionId) {
                                        const timestamp = sale.transactionDateTime || new Date().toISOString();
                                        const serial = sale.serialNumber || 'unknown';
                                        const amount = sale.totalAmount || sale.saleAmount || 0;
                                        const sequence = sale.sequenceNumber || Math.floor(Math.random() * 10000);
                                        transactionId = `${serial}-${timestamp.replace(/[^0-9]/g, '').slice(0, 14)}-${amount}-${sequence}`;
                                        this.logger.warn(`Generated fallback ID for transaction: ${transactionId}`);
                                    }
                                }
                                this.logger.debug(`Using transaction ID: ${transactionId} (original: ${sale.id}, type: ${typeof transactionId})`);
                                if (!transactionId || transactionId === undefined || transactionId === null || transactionId === '') {
                                    const errorMsg = `Skipping transaction - unable to generate valid ID. Sale data: ${JSON.stringify(sale, null, 2)}`;
                                    errors.push(errorMsg);
                                    this.logger.error(errorMsg);
                                    continue;
                                }
                                if (!sale.transactionDateTime) {
                                    const errorMsg = `Skipping transaction ${transactionId} with missing transactionDateTime`;
                                    errors.push(errorMsg);
                                    this.logger.warn(errorMsg);
                                    continue;
                                }
                                if (!sale.saleAmount && sale.saleAmount !== 0) {
                                    const errorMsg = `Skipping transaction ${transactionId} with missing saleAmount`;
                                    errors.push(errorMsg);
                                    this.logger.warn(errorMsg);
                                    continue;
                                }
                                if (!sale.totalAmount && sale.totalAmount !== 0) {
                                    const errorMsg = `Skipping transaction ${transactionId} with missing totalAmount`;
                                    errors.push(errorMsg);
                                    this.logger.warn(errorMsg);
                                    continue;
                                }
                                if (!sale.transactionType) {
                                    const errorMsg = `Skipping transaction ${transactionId} with missing transactionType`;
                                    errors.push(errorMsg);
                                    this.logger.warn(errorMsg);
                                    continue;
                                }
                                const existingTransaction = await this.prisma.pOSTransaction.findUnique({
                                    where: { tuuSaleId: transactionId }
                                });
                                if (!existingTransaction) {
                                    const mappedStatus = this.mapTuuStatusToPrisma(sale.status);
                                    const transactionData = {
                                        tuuSaleId: transactionId,
                                        sequenceNumber: sale.sequenceNumber || null,
                                        serialNumber: sale.serialNumber || null,
                                        locationId: branchData.location?.id || null,
                                        address: branchData.location?.address || null,
                                        status: mappedStatus,
                                        transactionDateTime: new Date(sale.transactionDateTime),
                                        transactionType: sale.transactionType,
                                        saleAmount: parseFloat(sale.saleAmount?.toString() || '0'),
                                        totalAmount: parseFloat(sale.totalAmount?.toString() || '0'),
                                        tenantId: null,
                                    };
                                    this.logger.debug('Creating transaction with data:', {
                                        tuuSaleId: transactionData.tuuSaleId,
                                        originalSaleId: sale.id,
                                        status: transactionData.status,
                                        originalStatus: sale.status,
                                        transactionDateTime: transactionData.transactionDateTime,
                                        transactionType: transactionData.transactionType,
                                        saleAmount: transactionData.saleAmount,
                                        totalAmount: transactionData.totalAmount,
                                        locationId: transactionData.locationId,
                                        address: transactionData.address,
                                        merchant: branchData.merchant
                                    });
                                    await this.prisma.pOSTransaction.create({
                                        data: {
                                            tuuSaleId: transactionData.tuuSaleId,
                                            sequenceNumber: transactionData.sequenceNumber,
                                            serialNumber: transactionData.serialNumber,
                                            locationId: transactionData.locationId,
                                            address: transactionData.address,
                                            status: transactionData.status,
                                            transactionDateTime: transactionData.transactionDateTime,
                                            transactionType: transactionData.transactionType,
                                            saleAmount: transactionData.saleAmount,
                                            totalAmount: transactionData.totalAmount,
                                            tenantId: transactionData.tenantId,
                                            items: {
                                                create: sale.items?.map(item => ({
                                                    code: item.code,
                                                    name: item.name,
                                                    quantity: item.quantity,
                                                    price: item.price,
                                                    tenantId: null,
                                                })) || []
                                            },
                                            syncLogs: {
                                                connect: { id: syncLog.id }
                                            }
                                        },
                                        include: {
                                            items: true
                                        }
                                    });
                                    createdTransactions++;
                                    this.logger.debug(`Created transaction: ${transactionId} (original: ${sale.id})`);
                                }
                                else {
                                    this.logger.debug(`Transaction already exists: ${transactionId} (original: ${sale.id})`);
                                }
                            }
                            catch (error) {
                                const usedId = transactionId || sale.id || 'unknown';
                                const errorMsg = `Failed to process transaction ${usedId}: ${error.message}`;
                                errors.push(errorMsg);
                                this.logger.error('Full Prisma error:', {
                                    message: error.message,
                                    code: error.code,
                                    meta: error.meta,
                                    stack: error.stack?.split('\n').slice(0, 5)
                                });
                                this.logger.error('Transaction data that failed:', {
                                    generatedTuuSaleId: transactionId,
                                    originalSaleId: sale.id,
                                    status: sale.status,
                                    mappedStatus: this.mapTuuStatusToPrisma(sale.status),
                                    transactionDateTime: sale.transactionDateTime,
                                    parsedDateTime: new Date(sale.transactionDateTime),
                                    transactionType: sale.transactionType,
                                    saleAmount: sale.saleAmount,
                                    saleAmountType: typeof sale.saleAmount,
                                    totalAmount: sale.totalAmount,
                                    totalAmountType: typeof sale.totalAmount,
                                    locationId: branchData.location?.id,
                                    merchant: branchData.merchant
                                });
                            }
                        }
                    }
                }
                if (!anyData) {
                    await this.prisma.pOSSyncLog.update({
                        where: { id: syncLog.id },
                        data: {
                            status: 'COMPLETED',
                            completedAt: new Date(),
                            totalProcessed: 0,
                            totalCreated: 0,
                            totalErrors: 0,
                            errorDetails: null
                        }
                    });
                    return {
                        success: true,
                        message: 'No transactions for selected range',
                        processedTransactions: 0,
                        createdTransactions: 0,
                        errors
                    };
                }
                const prismaAny3 = this.prisma;
                await prismaAny3.pOSSyncLog.update({
                    where: { id: syncLog.id },
                    data: {
                        status: 'COMPLETED',
                        completedAt: new Date(),
                        totalProcessed: processedTransactions,
                        totalCreated: createdTransactions,
                        totalErrors: errors.length,
                        errorDetails: errors.length > 0 ? { errors } : null,
                        responseData: lastBranchReportResponse
                    }
                });
                const message = `Sync completed successfully. Processed: ${processedTransactions}, Created: ${createdTransactions}`;
                this.logger.log(message);
                return {
                    success: true,
                    message,
                    processedTransactions,
                    createdTransactions,
                    errors
                };
            }
            catch (error) {
                const syncLog = await this.prisma.pOSSyncLog.create({
                    data: {
                        syncType: 'MANUAL',
                        status: 'FAILED',
                        startDate: new Date(),
                        endDate: new Date(),
                        startedAt: new Date(),
                        apiEndpoint: '/BranchReport/branch-report',
                        tenantId: null
                    }
                });
                await this.prisma.pOSSyncLog.update({
                    where: { id: syncLog.id },
                    data: {
                        status: 'FAILED',
                        completedAt: new Date(),
                        totalProcessed: processedTransactions,
                        totalCreated: createdTransactions,
                        totalErrors: errors.length,
                        errorDetails: errors.length > 0 ? { errors } : null,
                        errorMessage: error.message,
                    }
                });
                throw error;
            }
        }
        catch (error) {
            const message = `POS sync failed: ${error.message}`;
            this.logger.error(message, error);
            return {
                success: false,
                message,
                processedTransactions,
                createdTransactions,
                errors: [...errors, error.message]
            };
        }
    }
    async scheduledSync() {
        if (!this.isEnabled) {
            this.logger.log('Scheduled POS sync skipped - disabled');
            return;
        }
        this.logger.log('Starting scheduled POS sync');
        const config = await this.prisma.pOSConfiguration.findFirst({});
        if (!config?.autoSyncEnabled) {
            this.logger.log('Scheduled POS sync skipped - auto sync disabled');
            return;
        }
        const daysToSync = config.maxDaysToSync || 60;
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - daysToSync * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const result = await this.syncBranchReportData(startDate, endDate);
        if (result.success) {
            this.logger.log(`Scheduled sync completed: ${result.message}`);
        }
        else {
            this.logger.error(`Scheduled sync failed: ${result.message}`);
        }
        await this.cleanupOldData();
    }
    async getBranchReportData(request) {
        if (!this.api) {
            throw new Error('Tuu API not initialized');
        }
        try {
            const payload = {
                page: request.page ?? 1,
                pageSize: request.pageSize ?? 20,
                from: request.from,
                to: request.to,
                startDate: request.from,
                endDate: request.to,
                locationId: request.locationId,
                serialNumber: request.serialNumber,
                typeTransaction: request.typeTransaction,
                cardBrand: request.cardBrand,
            };
            this.logger.debug(`Calling Tuu BranchReport with payload: ${JSON.stringify(payload)}`);
            const response = await this.api.post('/BranchReport/branch-report', payload);
            return response.data;
        }
        catch (error) {
            const status = error.response?.status;
            const respData = error.response?.data;
            const inferredMsg = (respData && (respData.message || respData.error))
                || (typeof respData === 'string' ? respData : '')
                || error.message;
            const details = respData ? JSON.stringify(respData).slice(0, 800) : '';
            if (status === 401) {
                throw new Error('Invalid API key for Tuu service');
            }
            else if (status && status >= 500) {
                throw new Error('Tuu service is temporarily unavailable');
            }
            else {
                throw new Error(`Tuu API error (${status || 'unknown'}): ${inferredMsg}${details ? ` | details=${details}` : ''}`);
            }
        }
    }
    async getReportData(request) {
        if (!this.api) {
            throw new Error('Tuu API not initialized');
        }
        try {
            const response = await this.api.post('/Report/get-report', request);
            return response.data;
        }
        catch (error) {
            if (error.response?.status === 401) {
                throw new Error('Invalid API key for Tuu service');
            }
            else if (error.response?.status >= 500) {
                throw new Error('Tuu service is temporarily unavailable');
            }
            else {
                throw new Error(`Tuu Report API error: ${error.message}`);
            }
        }
    }
    async syncBranchReportDataPaginated(fromDate, toDate, filters = {}) {
        const syncId = `sync_paginated_${Date.now()}`;
        const startTime = new Date();
        const errors = [];
        let processedTransactions = 0;
        let createdTransactions = 0;
        let pagesProcessed = 0;
        let totalPages = 1;
        try {
            if (!this.isEnabled) {
                const message = 'POS sync is disabled or not configured properly';
                this.logger.warn(message);
                return {
                    success: false,
                    message,
                    processedTransactions: 0,
                    createdTransactions: 0,
                    errors: [message],
                    totalPages: 0,
                    pagesProcessed: 0
                };
            }
            const endDate = toDate || new Date().toISOString().split('T')[0];
            const startDate = fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            this.logger.log(`Starting paginated POS sync for date range: ${startDate} to ${endDate}`);
            const prismaAny = this.prisma;
            const syncLog = await prismaAny.pOSSyncLog.create({
                data: {
                    syncType: 'MANUAL',
                    status: 'RUNNING',
                    startDate: new Date(startDate + 'T00:00:00.000Z'),
                    endDate: new Date(endDate + 'T23:59:59.999Z'),
                    startedAt: new Date(),
                    apiEndpoint: '/BranchReport/branch-report',
                    tenantId: null
                }
            });
            try {
                const pageSize = Math.min(filters.pageSize || 20, 20);
                const maxPages = filters.maxPages || 50;
                const chunks = this.chunkDateRange(startDate, endDate, 30);
                for (const chunk of chunks) {
                    let currentPage = 1;
                    do {
                        const branchReportResponse = await this.getBranchReportData({
                            from: chunk.from,
                            to: chunk.to,
                            page: currentPage,
                            pageSize,
                            locationId: filters.locationId,
                            serialNumber: filters.serialNumber,
                            typeTransaction: filters.typeTransaction,
                            cardBrand: filters.cardBrand,
                        });
                        const branches = this.extractBranchData(branchReportResponse);
                        if (!branches.length) {
                            this.logger.warn(`No data received from Tuu API for page ${currentPage} (range ${chunk.from}..${chunk.to})`);
                            break;
                        }
                        totalPages = branchReportResponse.pagination?.totalPages || 1;
                        pagesProcessed = currentPage;
                        this.logger.log(`Processing page ${currentPage} of ${totalPages} (${branches.length} records) for range ${chunk.from}..${chunk.to}`);
                        for (const branchData of branches) {
                            const sales = Array.isArray(branchData.sales) ? branchData.sales : [];
                            for (const sale of sales) {
                                try {
                                    processedTransactions++;
                                    let transactionId = sale.id;
                                    if (!transactionId || transactionId === undefined || transactionId === null || transactionId === '') {
                                        transactionId = sale.transactionId || sale.saleId || sale.tuuSaleId;
                                        if (!transactionId) {
                                            const timestamp = sale.transactionDateTime || new Date().toISOString();
                                            const serial = sale.serialNumber || 'unknown';
                                            const amount = sale.totalAmount || sale.saleAmount || 0;
                                            const sequence = sale.sequenceNumber || Math.floor(Math.random() * 10000);
                                            transactionId = `${serial}-${timestamp.replace(/[^0-9]/g, '').slice(0, 14)}-${amount}-${sequence}`;
                                            this.logger.warn(`Generated fallback ID for paginated transaction: ${transactionId}`);
                                        }
                                    }
                                    if (!transactionId || transactionId === undefined || transactionId === null || transactionId === '') {
                                        const errorMsg = `Skipping transaction - unable to generate valid ID: ${JSON.stringify(sale)}`;
                                        errors.push(errorMsg);
                                        this.logger.warn(errorMsg);
                                        continue;
                                    }
                                    if (!sale.transactionDateTime) {
                                        const errorMsg = `Skipping transaction ${transactionId} with missing transactionDateTime`;
                                        errors.push(errorMsg);
                                        this.logger.warn(errorMsg);
                                        continue;
                                    }
                                    if (!sale.saleAmount && sale.saleAmount !== 0) {
                                        const errorMsg = `Skipping transaction ${transactionId} with missing saleAmount`;
                                        errors.push(errorMsg);
                                        this.logger.warn(errorMsg);
                                        continue;
                                    }
                                    if (!sale.totalAmount && sale.totalAmount !== 0) {
                                        const errorMsg = `Skipping transaction ${transactionId} with missing totalAmount`;
                                        errors.push(errorMsg);
                                        this.logger.warn(errorMsg);
                                        continue;
                                    }
                                    if (!sale.transactionType) {
                                        const errorMsg = `Skipping transaction ${transactionId} with missing transactionType`;
                                        errors.push(errorMsg);
                                        this.logger.warn(errorMsg);
                                        continue;
                                    }
                                    const existingTransaction = await prismaAny.pOSTransaction.findUnique({
                                        where: { tuuSaleId: transactionId }
                                    });
                                    if (!existingTransaction) {
                                        await prismaAny.pOSTransaction.create({
                                            data: {
                                                tuuSaleId: transactionId,
                                                sequenceNumber: sale.sequenceNumber,
                                                serialNumber: sale.serialNumber,
                                                locationId: branchData.location.id,
                                                address: branchData.location.address,
                                                merchant: branchData.merchant,
                                                status: this.mapTuuStatusToPrisma(sale.status),
                                                transactionDateTime: new Date(sale.transactionDateTime),
                                                transactionType: sale.transactionType,
                                                saleAmount: sale.saleAmount,
                                                totalAmount: sale.totalAmount,
                                                tenantId: null,
                                                createdBy: 'pos-sync-paginated',
                                                items: {
                                                    create: sale.items?.map(item => ({
                                                        code: item.code,
                                                        name: item.name,
                                                        quantity: item.quantity,
                                                        price: item.price,
                                                        tenantId: null,
                                                        createdBy: 'pos-sync-paginated',
                                                    })) || []
                                                },
                                                syncLogs: {
                                                    connect: { id: syncLog.id }
                                                }
                                            },
                                            include: {
                                                items: true
                                            }
                                        });
                                        createdTransactions++;
                                        this.logger.debug(`Created paginated transaction: ${transactionId} (original: ${sale.id})`);
                                    }
                                    else {
                                        this.logger.debug(`Paginated transaction already exists: ${transactionId} (original: ${sale.id})`);
                                    }
                                }
                                catch (error) {
                                    const usedId = transactionId || sale.id || 'unknown';
                                    const errorMsg = `Failed to process paginated transaction ${usedId}: ${error.message}`;
                                    errors.push(errorMsg);
                                    this.logger.error(errorMsg, error);
                                }
                            }
                        }
                        currentPage++;
                        if (currentPage > maxPages || currentPage > totalPages) {
                            break;
                        }
                        if (currentPage <= totalPages) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                    } while (currentPage <= totalPages);
                }
                await this.prisma.pOSSyncLog.update({
                    where: { id: syncLog.id },
                    data: {
                        status: 'COMPLETED',
                        completedAt: new Date(),
                        totalProcessed: processedTransactions,
                        totalCreated: createdTransactions,
                        totalErrors: errors.length,
                        errorDetails: errors.length > 0 ? { errors } : null
                    }
                });
                const message = `Paginated sync completed successfully. Processed: ${processedTransactions}, Created: ${createdTransactions}, Pages: ${pagesProcessed}/${totalPages}`;
                this.logger.log(message);
                return {
                    success: true,
                    message,
                    processedTransactions,
                    createdTransactions,
                    errors,
                    totalPages,
                    pagesProcessed
                };
            }
            catch (error) {
                const prismaAny4 = this.prisma;
                await prismaAny4.pOSSyncLog.update({
                    where: { id: syncLog.id },
                    data: {
                        status: 'FAILED',
                        completedAt: new Date(),
                        totalProcessed: processedTransactions,
                        totalCreated: createdTransactions,
                        totalErrors: errors.length + 1,
                        errorMessage: error.message,
                        errorDetails: { errors: [...errors, error.message] }
                    }
                });
                throw error;
            }
        }
        catch (error) {
            const message = `Paginated POS sync failed: ${error.message}`;
            this.logger.error(message, error);
            return {
                success: false,
                message,
                processedTransactions,
                createdTransactions,
                errors: [...errors, error.message],
                totalPages,
                pagesProcessed
            };
        }
    }
    mapTuuStatusToPrisma(tuuStatus) {
        switch (tuuStatus) {
            case 'SUCCESSFUL':
                return 'COMPLETED';
            case 'FAILED':
                return 'FAILED';
            case 'PENDING':
                return 'PENDING';
            default:
                this.logger.warn(`Unknown Tuu status '${tuuStatus}', mapping to FAILED`);
                return 'FAILED';
        }
    }
    async testDatabaseInsertion() {
        try {
            this.logger.log('Testing database insertion with known good data...');
            const testTransaction = await this.prisma.pOSTransaction.create({
                data: {
                    tuuSaleId: `test-${Date.now()}`,
                    status: 'COMPLETED',
                    transactionDateTime: new Date(),
                    transactionType: 'DEBIT',
                    saleAmount: 1000.00,
                    totalAmount: 1000.00,
                    tenantId: null,
                    sequenceNumber: 'TEST-001',
                    serialNumber: 'TEST-SERIAL',
                    locationId: 'test-location',
                    address: 'Test Address'
                }
            });
            this.logger.log('Test transaction created successfully:', testTransaction);
            await this.prisma.pOSTransaction.delete({
                where: { id: testTransaction.id }
            });
            this.logger.log('Test transaction deleted successfully');
            return { success: true, message: 'Database insertion test passed' };
        }
        catch (error) {
            this.logger.error('Test insertion failed:', {
                message: error.message,
                code: error.code,
                meta: error.meta
            });
            return { success: false, error: error.message, details: error };
        }
    }
    extractBranchData(resp) {
        if (!resp)
            return [];
        const data = resp.data ?? resp?.Data ?? null;
        if (Array.isArray(data))
            return data;
        if (data && typeof data === 'object' && Array.isArray(data.sales)) {
            return [data];
        }
        if (data && typeof data === 'object' && Array.isArray(data.transactions)) {
            const txs = data.transactions;
            const branchLike = {
                merchant: data.commerce?.name || 'unknown',
                location: { id: 'unknown', address: '' },
                sales: txs.map(t => {
                    const generatedId = t.id || t.transactionId || `${t.serialNumber}-${t.dateTime}-${t.amount}`;
                    console.log('ID Generation Debug:', {
                        originalId: t.id,
                        transactionId: t.transactionId,
                        serialNumber: t.serialNumber,
                        dateTime: t.dateTime,
                        amount: t.amount,
                        generatedId: generatedId
                    });
                    return {
                        id: generatedId,
                        sequenceNumber: t.sequenceNumber || undefined,
                        serialNumber: t.serialNumber,
                        status: t.status,
                        transactionDateTime: t.dateTime || t.transactionDateTime,
                        transactionType: t.type || t.transactionType,
                        saleAmount: t.amount || t.saleAmount,
                        totalAmount: t.amount || t.totalAmount,
                        items: t.items || [],
                    };
                })
            };
            return [branchLike];
        }
        return [];
    }
    chunkDateRange(startYmd, endYmd, maxDays) {
        const chunks = [];
        const start = new Date(startYmd + 'T00:00:00Z');
        const end = new Date(endYmd + 'T00:00:00Z');
        if (isNaN(start.getTime()) || isNaN(end.getTime()))
            return chunks;
        let cur = new Date(start);
        while (cur <= end) {
            const chunkStart = new Date(cur);
            const chunkEnd = new Date(cur);
            chunkEnd.setUTCDate(chunkEnd.getUTCDate() + (maxDays - 1));
            if (chunkEnd > end)
                chunkEnd.setTime(end.getTime());
            chunks.push({ from: this.toYmd(chunkStart), to: this.toYmd(chunkEnd) });
            cur = new Date(chunkEnd);
            cur.setUTCDate(cur.getUTCDate() + 1);
        }
        return chunks;
    }
    toYmd(d) {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }
    async cleanupOldData() {
        return;
    }
    async getPosConfiguration() {
        try {
            return await this.prisma.pOSConfiguration.findFirst();
        }
        catch (error) {
            this.logger.error('Failed to get POS configuration:', error);
            return null;
        }
    }
    async updatePosConfiguration(data) {
        const config = await this.prisma.pOSConfiguration.findFirst({
            where: {}
        });
        if (config) {
            const updated = await this.prisma.pOSConfiguration.update({
                where: { id: config.id },
                data: {
                    ...data,
                    updatedAt: new Date(),
                }
            });
            if (data.apiKey || data.baseUrl) {
                await this.initializeApi();
            }
            return updated;
        }
        else {
            const prismaAny9 = this.prisma;
            return prismaAny9.pOSConfiguration.create({
                data: {
                    ...data,
                    tenantId: null,
                }
            });
        }
    }
    async getSyncHistory(limit = 20) {
        try {
            return await this.prisma.pOSSyncLog.findMany({
                orderBy: { startedAt: 'desc' },
                take: limit,
            });
        }
        catch (error) {
            this.logger.error('Failed to get sync history:', error);
            return [];
        }
    }
    async getPosTransactions(filters = {}) {
        const { startDate, endDate, status, limit = 50, offset = 0 } = filters;
        const where = {};
        if (startDate || endDate) {
            where.transactionDateTime = {};
            if (startDate) {
                where.transactionDateTime.gte = new Date(startDate + 'T00:00:00.000Z');
            }
            if (endDate) {
                where.transactionDateTime.lte = new Date(endDate + 'T23:59:59.999Z');
            }
        }
        if (status) {
            where.status = status;
        }
        const prismaAny11 = this.prisma;
        const [transactions, total] = await Promise.all([
            prismaAny11.pOSTransaction.findMany({
                where,
                include: {
                    items: true,
                },
                orderBy: { transactionDateTime: 'desc' },
                take: limit,
                skip: offset,
            }),
            prismaAny11.pOSTransaction.count({ where })
        ]);
        return {
            transactions,
            total,
            limit,
            offset,
            hasMore: offset + transactions.length < total
        };
    }
    async getPosTransactionsAdvanced(filters = {}) {
        const { startDate, endDate, status, locationId, serialNumber, merchant, limit = 50, offset = 0 } = filters;
        const where = {};
        if (startDate || endDate) {
            where.transactionDateTime = {};
            if (startDate) {
                where.transactionDateTime.gte = new Date(startDate + 'T00:00:00.000Z');
            }
            if (endDate) {
                where.transactionDateTime.lte = new Date(endDate + 'T23:59:59.999Z');
            }
        }
        if (status) {
            where.status = status;
        }
        if (locationId) {
            where.locationId = locationId;
        }
        if (serialNumber) {
            where.serialNumber = serialNumber;
        }
        if (merchant) {
            where.merchant = {
                contains: merchant,
                mode: 'insensitive'
            };
        }
        const prismaAny12 = this.prisma;
        const [transactions, total, locationStats, deviceStats] = await Promise.all([
            prismaAny12.pOSTransaction.findMany({
                where,
                include: {
                    items: true,
                },
                orderBy: { transactionDateTime: 'desc' },
                take: limit,
                skip: offset,
            }),
            prismaAny12.pOSTransaction.count({ where }),
            prismaAny12.pOSTransaction.groupBy({
                by: ['locationId', 'address'],
                where,
                _count: { id: true },
                _sum: { totalAmount: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),
            prismaAny12.pOSTransaction.groupBy({
                by: ['serialNumber'],
                where,
                _count: { id: true },
                _sum: { totalAmount: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            })
        ]);
        return {
            transactions,
            total,
            limit,
            offset,
            hasMore: offset + transactions.length < total,
            analytics: {
                locationBreakdown: locationStats.map(stat => ({
                    locationId: stat.locationId,
                    address: stat.address,
                    transactionCount: stat._count.id,
                    totalAmount: stat._sum.totalAmount || 0
                })),
                deviceBreakdown: deviceStats.map(stat => ({
                    serialNumber: stat.serialNumber,
                    transactionCount: stat._count.id,
                    totalAmount: stat._sum.totalAmount || 0
                }))
            }
        };
    }
};
exports.PosSyncService = PosSyncService;
__decorate([
    (0, schedule_1.Cron)('0 2 * * *', {
        name: 'pos-daily-sync',
        timeZone: 'America/Santiago',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PosSyncService.prototype, "scheduledSync", null);
exports.PosSyncService = PosSyncService = PosSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PosSyncService);
//# sourceMappingURL=pos-sync.service.js.map