import { IPaymentGatewayPort } from '../../Application/Ports/IPaymentGatewayPort';

export class FakePaymentGatewayAdapter implements IPaymentGatewayPort {
  public async charge(amount: number, currency: string, orderId: string): Promise<boolean> {
    // Емуляція успішного платежу без виходу в мережу
    return amount > 0;
  }
}
