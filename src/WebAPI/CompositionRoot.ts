import { InMemoryOrderRepository } from '../Infrastructure/Repositories/InMemoryOrderRepository';
import { FakePaymentGatewayAdapter } from '../Infrastructure/Adapters/FakePaymentGatewayAdapter';
import { CreateOrderUseCase } from '../Application/UseCases/CreateOrderUseCase';
import { OrderController } from './Controllers/OrderController';

/**
 * Composition Root (Композиційний корінь).
 * Єдине місце в системі, яке знає про конкретні реалізації адаптерів і фабрикує екземпляри.
 */
export class ServiceContainer {
  // Singleton: спільний стан сховища в пам'яті на весь процес виконання
  private static inMemoryOrderRepo = new InMemoryOrderRepository();

  // Transient: створюється наново на кожен виклик, оскільки не містить стану
  public static getPaymentGateway(): FakePaymentGatewayAdapter {
    return new FakePaymentGatewayAdapter();
  }

  // Scoped: типовий вибір для сценарію використання на час одного запиту
  public static getCreateOrderUseCase(): CreateOrderUseCase {
    return new CreateOrderUseCase(
      this.inMemoryOrderRepo,
      this.getPaymentGateway()
    );
  }

  // Scoped / Transient: точка входу API контролера
  public static getOrderController(): OrderController {
    return new OrderController(this.getCreateOrderUseCase());
  }
}
