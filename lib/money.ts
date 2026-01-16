import Decimal from 'decimal.js';

export function toDecimal(value: Decimal.Value) {
  return new Decimal(value as any);
}

export function centsToDecimal(cents: number) {
  return new Decimal(cents).dividedBy(100);
}

export function decimalToCents(d: Decimal) {
  return d.times(100).toNumber();
}

export function add(a: Decimal.Value, b: Decimal.Value) {
  return toDecimal(a).plus(toDecimal(b));
}

export function mul(a: Decimal.Value, b: Decimal.Value) {
  return toDecimal(a).times(toDecimal(b));
}

export function roundMoney(d: Decimal.Value, dp = 2) {
  return toDecimal(d).toDecimalPlaces(dp, Decimal.ROUND_HALF_UP);
}
