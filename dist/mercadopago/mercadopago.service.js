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
var MercadoPagoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let MercadoPagoService = MercadoPagoService_1 = class MercadoPagoService {
    configService;
    logger = new common_1.Logger(MercadoPagoService_1.name);
    api;
    accessToken;
    publicKey;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        this.accessToken = this.configService.get('MP_ACCESS_TOKEN') ||
            this.configService.get('MERCADOPAGO_ACCESS_TOKEN');
        this.publicKey = this.configService.get('MP_PUBLIC_KEY') ||
            this.configService.get('MERCADOPAGO_PUBLIC_KEY');
        if (!this.accessToken) {
            this.logger.warn('MercadoPago access token not configured (tried MP_ACCESS_TOKEN and MERCADOPAGO_ACCESS_TOKEN)');
            return;
        }
        if (!this.publicKey) {
            this.logger.warn('MercadoPago public key not configured (tried MP_PUBLIC_KEY and MERCADOPAGO_PUBLIC_KEY)');
        }
        this.api = axios_1.default.create({
            baseURL: 'https://api.mercadopago.com',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
        this.api.interceptors.request.use((config) => {
            this.logger.debug(`MercadoPago API Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            this.logger.error('MercadoPago API Request Error:', error.message);
            return Promise.reject(error);
        });
        this.api.interceptors.response.use((response) => {
            this.logger.debug(`MercadoPago API Response: ${response.status}`);
            return response;
        }, (error) => {
            this.logger.error('MercadoPago API Response Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            return Promise.reject(error);
        });
    }
    getStatus() {
        const hasAccessToken = !!this.accessToken;
        const hasPublicKey = !!this.publicKey;
        const configured = hasAccessToken && hasPublicKey;
        let message = 'MercadoPago SDK Status';
        if (!hasPublicKey) {
            message = 'MercadoPago public key not configured';
        }
        else if (!hasAccessToken) {
            message = 'MercadoPago access token not configured';
        }
        else {
            message = 'MercadoPago SDK configured successfully';
        }
        return {
            configured,
            hasAccessToken,
            hasPublicKey,
            publicKey: hasPublicKey ? this.publicKey : undefined,
            message
        };
    }
    async getTransactions(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.begin_date) {
                queryParams.append('begin_date', params.begin_date);
            }
            if (params.end_date) {
                queryParams.append('end_date', params.end_date);
            }
            if (params.status) {
                queryParams.append('status', params.status);
            }
            if (params.operation_type) {
                queryParams.append('operation_type', params.operation_type);
            }
            queryParams.append('limit', String(params.limit || 50));
            queryParams.append('offset', String(params.offset || 0));
            if (params.sort) {
                queryParams.append('sort', params.sort);
            }
            if (params.criteria) {
                queryParams.append('criteria', params.criteria);
            }
            const response = await this.api.get(`/v1/payments/search?${queryParams.toString()}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch MercadoPago transactions:', error);
            throw error;
        }
    }
    async getTransaction(paymentId) {
        try {
            const response = await this.api.get(`/v1/payments/${paymentId}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch payment ${paymentId}:`, error);
            throw error;
        }
    }
    async getAccountBalance(userId) {
        try {
            const userIdToUse = userId || 'me';
            const response = await this.api.get(`/users/${userIdToUse}/mercadopago_account/balance`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch account balance:', error);
            throw error;
        }
    }
    async getBankMovements(params) {
        try {
            const userId = params.user_id || 'me';
            const queryParams = new URLSearchParams({
                begin_date: params.begin_date,
                end_date: params.end_date,
                offset: String(params.offset || 0),
                limit: String(params.limit || 50),
            });
            const response = await this.api.get(`/users/${userId}/mercadopago_account/bank_report?${queryParams.toString()}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch bank movements:', error);
            throw error;
        }
    }
    async getAccountMovements(params = {}) {
        try {
            const userId = params.user_id || 'me';
            const queryParams = new URLSearchParams();
            if (params.begin_date)
                queryParams.append('begin_date', params.begin_date);
            if (params.end_date)
                queryParams.append('end_date', params.end_date);
            if (params.status)
                queryParams.append('status', params.status);
            if (params.operation_type)
                queryParams.append('operation_type', params.operation_type);
            queryParams.append('limit', String(params.limit || 50));
            queryParams.append('offset', String(params.offset || 0));
            const response = await this.api.get(`/users/${userId}/mercadopago_account/movements/search?${queryParams.toString()}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch account movements:', error);
            throw error;
        }
    }
    async getMerchantOrders(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            if (params.begin_date)
                queryParams.append('begin_date', params.begin_date);
            if (params.end_date)
                queryParams.append('end_date', params.end_date);
            queryParams.append('limit', String(params.limit || 50));
            queryParams.append('offset', String(params.offset || 0));
            const response = await this.api.get(`/merchant_orders/search?${queryParams.toString()}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch merchant orders:', error);
            throw error;
        }
    }
    async getChargebacks(paymentId) {
        try {
            const url = paymentId
                ? `/v1/chargebacks/search?payment_id=${paymentId}`
                : '/v1/chargebacks/search';
            const response = await this.api.get(url);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch chargebacks:', error);
            throw error;
        }
    }
    async getRefunds(paymentId) {
        try {
            const response = await this.api.get(`/v1/payments/${paymentId}/refunds`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch refunds for payment ${paymentId}:`, error);
            throw error;
        }
    }
    async createPreference(data) {
        try {
            const preference = {
                items: data.items || [],
                payer: data.payer || {},
                external_reference: data.external_reference || `order_${Date.now()}`,
                notification_url: data.notification_url || `${process.env.APP_URL}/mercadopago/webhook`,
                statement_descriptor: data.statement_descriptor || 'MURALLA',
                back_urls: data.back_urls || {
                    success: `${process.env.FRONTEND_URL}/finance/payment/success`,
                    failure: `${process.env.FRONTEND_URL}/finance/payment/failure`,
                    pending: `${process.env.FRONTEND_URL}/finance/payment/pending`,
                },
                auto_return: 'approved',
                binary_mode: data.binary_mode || false,
                payment_methods: {
                    excluded_payment_methods: data.excluded_payment_methods || [],
                    excluded_payment_types: data.excluded_payment_types || [],
                    installments: data.installments || 12,
                },
                shipments: data.shipments,
                metadata: data.metadata || {},
            };
            if (data.expires) {
                preference.expires = true;
                preference.expiration_date_from = data.expiration_date_from;
                preference.expiration_date_to = data.expiration_date_to;
            }
            if (data.date_of_expiration) {
                preference.date_of_expiration = data.date_of_expiration;
            }
            const response = await this.api.post('/checkout/preferences', preference);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to create preference:', error);
            throw error;
        }
    }
    async processPayment(data) {
        try {
            this.logger.log('Processing payment with data:', {
                amount: data.amount || data.transaction_amount,
                payment_method_id: data.payment_method_id,
                token: data.token ? 'PROVIDED' : 'MISSING',
                payer_email: data.payer?.email
            });
            const paymentData = {
                transaction_amount: Number(data.transaction_amount || data.amount),
                token: data.token,
                description: data.description || 'Payment',
                installments: Number(data.installments) || 1,
                payment_method_id: data.payment_method_id,
                payer: {
                    email: data.payer?.email || data.customerEmail || 'customer@example.com',
                    first_name: data.payer?.first_name || 'Customer',
                    last_name: data.payer?.last_name || 'Name',
                    identification: data.payer?.identification,
                },
                external_reference: data.external_reference || `payment_${Date.now()}`,
                statement_descriptor: data.statement_descriptor || 'MURALLA',
                metadata: data.metadata || {},
                three_d_secure_mode: data.three_d_secure_mode,
                capture: data.capture !== false,
                binary_mode: data.binary_mode || false,
            };
            if (data.additional_info) {
                paymentData.additional_info = data.additional_info;
            }
            this.logger.log('Sending payment to MercadoPago API:', {
                url: '/v1/payments',
                amount: paymentData.transaction_amount,
                payment_method_id: paymentData.payment_method_id
            });
            const idempotencyKey = data.idempotencyKey || `payment_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const response = await this.api.post('/v1/payments', paymentData, {
                headers: {
                    'X-Idempotency-Key': idempotencyKey
                }
            });
            this.logger.log(`Payment created: ${response.data.id} - Status: ${response.data.status}`);
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to process payment:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
                data: error.response?.data?.message || error.response?.data?.cause
            });
            if (error.response?.data) {
                throw new Error(error.response.data.message || error.response.data.cause || 'Payment processing failed');
            }
            throw error;
        }
    }
    async handleWebhook(notification) {
        try {
            this.logger.log(`Webhook received: ${notification.type} - ${notification.data?.id}`);
            switch (notification.type) {
                case 'payment':
                    const payment = await this.getTransaction(notification.data.id);
                    this.logger.log(`Payment webhook: ${payment.id} - Status: ${payment.status}`);
                    return { processed: true, payment };
                case 'merchant_order':
                    const order = await this.api.get(`/merchant_orders/${notification.data.id}`);
                    this.logger.log(`Merchant order webhook: ${order.data.id}`);
                    return { processed: true, order: order.data };
                case 'chargeback':
                    this.logger.warn(`Chargeback notification: ${notification.data.id}`);
                    return { processed: true, type: 'chargeback' };
                default:
                    this.logger.log(`Unknown webhook type: ${notification.type}`);
                    return { processed: false, type: notification.type };
            }
        }
        catch (error) {
            this.logger.error('Error handling webhook:', error);
            throw error;
        }
    }
};
exports.MercadoPagoService = MercadoPagoService;
exports.MercadoPagoService = MercadoPagoService = MercadoPagoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MercadoPagoService);
//# sourceMappingURL=mercadopago.service.js.map