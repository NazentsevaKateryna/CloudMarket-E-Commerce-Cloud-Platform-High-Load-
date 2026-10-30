import { CreateOrderUseCase } from '../src/Application/UseCases/CreateOrderUseCase';
import { IOrderRepository } from '../src/Domain/Repositories/IOrderRepository';
import { IPaymentGatewayPort } from '../src/Application/Ports/IPaymentGatewayPort';
import { OrderDomainException } from '../src/Domain/Exceptions/OrderDomainException';
import { Order } from '../src/Domain/Entities/Order';

describe('CreateOrderUseCase Unit Tests', () => {
  let mockRepo: IOrderRepository;
  let mockPayment: IPaymentGatewayPort;
  let savedOrders: Order[];

  beforeEach(() => {
    savedOrders = [];
    mockRepo = {
      save: async (order: Order) => {
        savedOrders.push(order);
      },
      findById: async () => null
    };
    mockPayment = {
      charge: async () => true
    };
  });

  // Тест 1: Успішний шлях зберігає замовлення зі статусом PAID
  it('1. Успішний шлях: повинен створювати, оплачувати та зберігати замовлення через репозиторій', async () => {
    const useCase = new CreateOrderUseCase(mockRepo, mockPayment);

    const result = await useCase.execute({
      orderId: 'ord-101',
      customerId: 'cust-1',
      deliveryAddress: 'м. Київ, вул. Хрещатик, 22',
      items: [{ productId: 'prod-1', quantity: 2, unitPrice: 500 }]
    });

    expect(result.status).toBe('PAID');
    expect(result.totalAmount).toBe(1000);
    expect(savedOrders.length).toBe(1);
    expect(savedOrders[0].id).toBe('ord-101');
  });

  // Тест 2: Порушення бізнес-правила домену не викликає збереження
  it('2. Відхилення за правилом домену: порожній кошик повинен викидати OrderDomainException і не зберігати замовлення', async () => {
    const useCase = new CreateOrderUseCase(mockRepo, mockPayment);

    await expect(
      useCase.execute({
        orderId: 'ord-102',
        customerId: 'cust-1',
        deliveryAddress: 'м. Київ, вул. Хрещатик, 22',
        items: [] // Порожній список порушує правило домену
      })
    ).rejects.toThrow(OrderDomainException);

    expect(savedOrders.length).toBe(0);
  });

  // Тест 3: Відмова зовнішнього порту еквайрингу передається як залежність і блокує збереження
  it('3. Помилка порту платежу: відмова шлюзу перериває процес і не записує замовлення', async () => {
    // Замінюємо поведінку моку еквайрингу на відмову
    mockPayment.charge = async () => false;

    const useCase = new CreateOrderUseCase(mockRepo, mockPayment);

    await expect(
      useCase.execute({
        orderId: 'ord-103',
        customerId: 'cust-1',
        deliveryAddress: 'м. Київ, вул. Хрещатик, 22',
        items: [{ productId: 'prod-2', quantity: 1, unitPrice: 1500 }]
      })
    ).rejects.toThrow('Платіж було відхилено еквайринговим шлюзом.');

    expect(savedOrders.length).toBe(0);
  });
});
