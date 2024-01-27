interface Order {
  amount: number;
  priceMenu: number;
  nameOrder: string;
  idType: string;
}

interface AllOrdersDate {
  order: Order[];
  dateTimeOrder: Date;
  priceTotal: number;
  type: string;
}

export interface OrdersAccountInterface {
  studentId: string;
  tenantId: string;
  userId: string;
  customerId: string;
  orderId: string;
  dateOrderMenu: Date;
  year: number;
  priceAllOrdersDate: number;
  allOrdersDate: AllOrdersDate[];

  // Uncomment and use this if you need to include the method in the interface.
  // calculateTotalPrice: () => void;
}

// If you have methods like calculateTotalPrice, you might want to implement them separately.
// For instance, as a function that takes an OrdersAccount as an argument.
