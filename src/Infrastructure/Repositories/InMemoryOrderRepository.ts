import { IOrderRepository } from '../../Domain/Repositories/IOrderRepository';
import { Order } from '../../Domain/Entities/Order';

export class InMemoryOrderRepository implements IOrderRepository {
  private readonly storage = new Map<string, Order>();

  public async save(order: Order): Promise<void> {
    this.storage.set(order.id, order);
  }

  public async findById(orderId: string): Promise<Order | null> {
    return this.storage.get(orderId) || null;
  }
}
