export interface CreatePaymentDto {
  transaction_amount: number;
  description: string;
  payment_method_id?: string;
  payer?: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  metadata?: Record<string, any>;
}