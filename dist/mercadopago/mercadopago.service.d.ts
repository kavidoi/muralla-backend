import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface MercadoPagoTransaction {
    id: number;
    date_created: string;
    date_approved?: string;
    date_last_updated: string;
    money_release_date?: string;
    operation_type: string;
    issuer_id?: string;
    payment_method_id: string;
    payment_type_id: string;
    status: string;
    status_detail: string;
    currency_id: string;
    description?: string;
    collector_id: number;
    payer: {
        id?: string;
        email?: string;
        identification?: {
            type: string;
            number: string;
        };
        type: string;
    };
    metadata?: any;
    additional_info?: any;
    transaction_amount: number;
    transaction_amount_refunded: number;
    coupon_amount: number;
    transaction_details?: {
        net_received_amount: number;
        total_paid_amount: number;
        overpaid_amount: number;
        installment_amount: number;
    };
    fee_details?: Array<{
        type: string;
        amount: number;
        fee_payer: string;
    }>;
    statement_descriptor?: string;
    installments: number;
    card?: {
        first_six_digits?: string;
        last_four_digits?: string;
        expiration_month?: number;
        expiration_year?: number;
        cardholder?: {
            name?: string;
            identification?: {
                type: string;
                number: string;
            };
        };
    };
}
interface SearchResponse {
    paging: {
        total: number;
        limit: number;
        offset: number;
    };
    results: MercadoPagoTransaction[];
}
export declare class MercadoPagoService implements OnModuleInit {
    private configService;
    private readonly logger;
    private api;
    private accessToken;
    private publicKey;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    getStatus(): {
        configured: boolean;
        hasAccessToken: boolean;
        hasPublicKey: boolean;
        publicKey?: string;
        message: string;
    };
    getTransactions(params?: {
        begin_date?: string;
        end_date?: string;
        status?: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
        operation_type?: 'regular_payment' | 'money_transfer' | 'recurring_payment' | 'account_fund' | 'payment_addition' | 'cellphone_recharge' | 'pos_payment';
        limit?: number;
        offset?: number;
        sort?: string;
        criteria?: 'date_created' | 'date_last_updated';
    }): Promise<SearchResponse>;
    getTransaction(paymentId: string): Promise<MercadoPagoTransaction>;
    getAccountBalance(userId?: string): Promise<any>;
    getBankMovements(params: {
        user_id?: string;
        begin_date: string;
        end_date: string;
        offset?: number;
        limit?: number;
    }): Promise<any>;
    getAccountMovements(params?: {
        user_id?: string;
        begin_date?: string;
        end_date?: string;
        status?: string;
        operation_type?: string;
        limit?: number;
        offset?: number;
    }): Promise<any>;
    getMerchantOrders(params?: {
        begin_date?: string;
        end_date?: string;
        limit?: number;
        offset?: number;
    }): Promise<any>;
    getChargebacks(paymentId?: string): Promise<any>;
    getRefunds(paymentId: string): Promise<any>;
    createPreference(data: any): Promise<any>;
    processPayment(data: any): Promise<any>;
    handleWebhook(notification: any): Promise<any>;
}
export {};
