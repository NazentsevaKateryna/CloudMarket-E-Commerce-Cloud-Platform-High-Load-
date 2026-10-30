import { Money } from '../ValueObjects/Money';
import { OrderDomainException } from '../Exceptions/OrderDomainException';

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface OrderItemProps {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export class Order {
  private _status: OrderStatus;
  private readonly _items: OrderItemProps[];

  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly deliveryAddress: string,
    items: OrderItemProps[]
  ) {
    if (!items || items.length === 0) {
      throw new OrderDomainException('Замовлення не може бути порожнім: потрібен щонайменше 1 товар.');
    }
    if (!deliveryAddress || deliveryAddress.trim().length < 5) {
      throw new OrderDomainException('Адреса доставки є недійсною або занадто короткою.');
    }
    this._items = [...items];
    this._status = OrderStatus.DRAFT;
  }

  public get items(): ReadonlyArray<OrderItemProps> {
    return this._items;
  }

  public get status(): OrderStatus {
    return this._status;
  }

  public calculateTotal(): Money {
    const total = this._items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    return new Money(total, 'UAH');
  }

  public markAsPaid(): void {
    if (this._status === OrderStatus.PAID) {
      throw new OrderDomainException('Замовлення вже має статус сплаченого.');
    }
    if (this._status === OrderStatus.CANCELLED) {
      throw new OrderDomainException('Неможливо оплатити скасоване замовлення.');
    }
    this._status = OrderStatus.PAID;
  }
}
