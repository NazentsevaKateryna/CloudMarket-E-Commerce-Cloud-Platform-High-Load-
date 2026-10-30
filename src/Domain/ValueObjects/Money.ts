export class Money {
  constructor(public readonly amount: number, public readonly currency: string = 'UAH') {
    if (amount < 0) {
      throw new Error('Сума грошей не може бути від’ємною.');
    }
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
