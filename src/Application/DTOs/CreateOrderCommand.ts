export interface CreateOrderCommandItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderCommand {
  orderId: string;
  customerId: string;
  deliveryAddress: string;
  items: CreateOrderCommandItem[];
}
