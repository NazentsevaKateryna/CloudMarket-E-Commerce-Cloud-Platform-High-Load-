import { IOrderRepository } from '../../Domain/Repositories/IOrderRepository';
import { IPaymentGatewayPort } from '../Ports/IPaymentGatewayPort';
import { CreateOrderCommand } from '../DTOs/CreateOrderCommand';
import { OrderResultDTO } from '../DTOs/OrderResultDTO';
import { Order } from '../../Domain/Entities/Order';
import { OrderDomainException } from '../../Domain/Exceptions/OrderDomainException';

export class CreateOrderUseCase {
  // Залежності інжектуються виключно через конструктор (Inversion of Control)
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentGateway: IPaymentGatewayPort
  ) {}

  public async execute(command: CreateOrderCommand): Promise<OrderResultDTO> {
    // 1. Створення сутності (перевіряються доменні інваріанти)
    const order = new Order(
      command.orderId,
      command.customerId,
      command.deliveryAddress,
      command.items
    );

    const total = order.calculateTotal();

    // 2. Виклик зовнішнього платіжного порту
    const paymentSuccess = await this.paymentGateway.charge(
      total.amount,
      total.currency,
      order.id
    );

    if (!paymentSuccess) {
      throw new OrderDomainException('Платіж було відхилено еквайринговим шлюзом.');
    }

    // 3. Зміна стану та збереження через порт сховища
    order.markAsPaid();
    await this.orderRepository.save(order);

    return {
      orderId: order.id,
      status: order.status,
      totalAmount: total.amount,
      currency: total.currency
    };
  }
}
