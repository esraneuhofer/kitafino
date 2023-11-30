export interface TransactionInterface {
  transactionId: string;
  date: Date;
  amount: number;
  type: 'deposit' | 'withdrawal';

}

export interface OrdersSingleInterface {
  studentId: string;
  orderId: string;
  date: Date;
  amount: number;
  price: number;
  type: 'order' | 'cancellation';
}

export interface AccountCustomerInterface {
  userId: string;
  customerId: string;
  customerNumber: string;
  transactions: TransactionInterface[];
  orders:OrdersSingleInterface[];
  currentBalance: number;
}

