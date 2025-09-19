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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoController = void 0;
const common_1 = require("@nestjs/common");
const mercadopago_service_1 = require("./mercadopago.service");
const passport_1 = require("@nestjs/passport");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const public_decorator_1 = require("../auth/public.decorator");
let MercadoPagoController = class MercadoPagoController {
    mercadoPagoService;
    constructor(mercadoPagoService) {
        this.mercadoPagoService = mercadoPagoService;
    }
    async getStatus() {
        return this.mercadoPagoService.getStatus();
    }
    async getTransactions(beginDate, endDate, status, operationType, limit, offset, sort, criteria) {
        const transactions = await this.mercadoPagoService.getTransactions({
            begin_date: beginDate,
            end_date: endDate,
            status,
            operation_type: operationType,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
            sort,
            criteria,
        });
        const summary = {
            total: transactions.paging.total,
            approved: transactions.results.filter(t => t.status === 'approved').length,
            pending: transactions.results.filter(t => t.status === 'pending').length,
            rejected: transactions.results.filter(t => t.status === 'rejected').length,
            totalAmount: transactions.results
                .filter(t => t.status === 'approved')
                .reduce((sum, t) => sum + t.transaction_amount, 0),
            totalFees: transactions.results
                .filter(t => t.status === 'approved')
                .reduce((sum, t) => {
                const fees = t.fee_details?.reduce((feeSum, fee) => feeSum + fee.amount, 0) || 0;
                return sum + fees;
            }, 0),
        };
        return {
            summary,
            paging: transactions.paging,
            transactions: transactions.results,
        };
    }
    async getTransaction(id) {
        return this.mercadoPagoService.getTransaction(id);
    }
    async getBalance() {
        return this.mercadoPagoService.getAccountBalance();
    }
    async getBankMovements(beginDate, endDate, limit, offset) {
        if (!beginDate || !endDate) {
            throw new Error('begin_date and end_date are required');
        }
        return this.mercadoPagoService.getBankMovements({
            begin_date: beginDate,
            end_date: endDate,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
    }
    async getAccountMovements(beginDate, endDate, status, operationType, limit, offset) {
        return this.mercadoPagoService.getAccountMovements({
            begin_date: beginDate,
            end_date: endDate,
            status,
            operation_type: operationType,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
    }
    async getMerchantOrders(beginDate, endDate, limit, offset) {
        return this.mercadoPagoService.getMerchantOrders({
            begin_date: beginDate,
            end_date: endDate,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
    }
    async getChargebacks(paymentId) {
        return this.mercadoPagoService.getChargebacks(paymentId);
    }
    async getRefunds(paymentId) {
        return this.mercadoPagoService.getRefunds(paymentId);
    }
    async createPreference(paymentData) {
        return this.mercadoPagoService.createPreference(paymentData);
    }
    async processPayment(paymentData) {
        return this.mercadoPagoService.processPayment(paymentData);
    }
    async handleWebhook(notification) {
        return this.mercadoPagoService.handleWebhook(notification);
    }
    async getTransactionSummary(beginDate, endDate) {
        const end = endDate || new Date().toISOString().split('T')[0];
        const start = beginDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const [transactions, balance] = await Promise.all([
            this.mercadoPagoService.getTransactions({
                begin_date: start,
                end_date: end,
                limit: 100,
            }),
            this.mercadoPagoService.getAccountBalance(),
        ]);
        const dailyStats = {};
        transactions.results.forEach(t => {
            const date = t.date_created.split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    date,
                    count: 0,
                    approved: 0,
                    rejected: 0,
                    pending: 0,
                    totalAmount: 0,
                    totalFees: 0,
                    netAmount: 0,
                };
            }
            dailyStats[date].count++;
            dailyStats[date][t.status]++;
            if (t.status === 'approved') {
                dailyStats[date].totalAmount += t.transaction_amount;
                const fees = t.fee_details?.reduce((sum, fee) => sum + fee.amount, 0) || 0;
                dailyStats[date].totalFees += fees;
                dailyStats[date].netAmount += (t.transaction_amount - fees);
            }
        });
        const paymentMethods = {};
        transactions.results.forEach(t => {
            const method = t.payment_method_id || 'unknown';
            if (!paymentMethods[method]) {
                paymentMethods[method] = {
                    method,
                    count: 0,
                    totalAmount: 0,
                };
            }
            paymentMethods[method].count++;
            if (t.status === 'approved') {
                paymentMethods[method].totalAmount += t.transaction_amount;
            }
        });
        return {
            period: { start, end },
            balance,
            overview: {
                totalTransactions: transactions.paging.total,
                approvedCount: transactions.results.filter(t => t.status === 'approved').length,
                pendingCount: transactions.results.filter(t => t.status === 'pending').length,
                rejectedCount: transactions.results.filter(t => t.status === 'rejected').length,
                totalRevenue: transactions.results
                    .filter(t => t.status === 'approved')
                    .reduce((sum, t) => sum + t.transaction_amount, 0),
                totalFees: transactions.results
                    .filter(t => t.status === 'approved')
                    .reduce((sum, t) => {
                    const fees = t.fee_details?.reduce((feeSum, fee) => feeSum + fee.amount, 0) || 0;
                    return sum + fees;
                }, 0),
            },
            dailyStats: Object.values(dailyStats).sort((a, b) => b.date.localeCompare(a.date)),
            paymentMethods: Object.values(paymentMethods).sort((a, b) => b.totalAmount - a.totalAmount),
        };
    }
};
exports.MercadoPagoController = MercadoPagoController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('begin_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('operation_type')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __param(6, (0, common_1.Query)('sort')),
    __param(7, (0, common_1.Query)('criteria')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Get)('balance'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('bank-movements'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('begin_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "getBankMovements", null);
__decorate([
    (0, common_1.Get)('movements'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('begin_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('operation_type')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "getAccountMovements", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('begin_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "getMerchantOrders", null);
__decorate([
    (0, common_1.Get)('chargebacks'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('payment_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "getChargebacks", null);
__decorate([
    (0, common_1.Get)('transactions/:id/refunds'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "getRefunds", null);
__decorate([
    (0, common_1.Post)('create-preference'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof create_payment_dto_1.CreatePaymentDto !== "undefined" && create_payment_dto_1.CreatePaymentDto) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "createPreference", null);
__decorate([
    (0, common_1.Post)('process-payment'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "processPayment", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('summary'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)('begin_date')),
    __param(1, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MercadoPagoController.prototype, "getTransactionSummary", null);
exports.MercadoPagoController = MercadoPagoController = __decorate([
    (0, common_1.Controller)('mercadopago'),
    __metadata("design:paramtypes", [mercadopago_service_1.MercadoPagoService])
], MercadoPagoController);
//# sourceMappingURL=mercadopago.controller.js.map