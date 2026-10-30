export interface IPaymentGatewayPort {
  charge(amount: number, currency: string, orderId: string): Promise<boolean>;
}
