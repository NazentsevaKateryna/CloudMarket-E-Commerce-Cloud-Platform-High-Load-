import { CreateOrderUseCase } from '../../Application/UseCases/CreateOrderUseCase';
import { CreateOrderCommand } from '../../Application/DTOs/CreateOrderCommand';

export class OrderController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

  public async handleCreateOrder(requestBody: any): Promise<{ statusCode: number; body: any }> {
    try {
      const command: CreateOrderCommand = {
        orderId: requestBody.orderId,
        customerId: requestBody.customerId,
        deliveryAddress: requestBody.deliveryAddress,
        items: requestBody.items
      };

      const result = await this.createOrderUseCase.execute(command);
      return { statusCode: 201, body: result };
    } catch (error: any) {
      return {
        statusCode: 400,
        body: { error: error.message }
      };
    }
  }
}
