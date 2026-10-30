export class OrderDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderDomainException';
  }
}
