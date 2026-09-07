export type IPaymentCreate = {
  tripId: string;
  method?: string;
};

export type IPayment = {
  id: string;
  customerId: string;
  tripId: string;
  transactionId: string | null;
  amount: number;
  method: string;
  status: string;
  paidAt: Date | null;
};
