import Decimal from 'decimal.js';
import { toDecimal, mul, roundMoney } from './money';

export type LineCalcInput = {
  unitPrice: Decimal.Value; // price without tax
  quantity: number;
  taxRate?: Decimal.Value; // percent, e.g., 21
  discountAmount?: Decimal.Value; // absolute discount for the entire line (not per unit)
  discountRate?: Decimal.Value; // percent 0-100
};

export type LineCalcResult = {
  priceNet: Decimal; // unit price
  lineBase: Decimal; // priceNet * qty
  discountAmount: Decimal; // absolute for line
  taxableBase: Decimal; // base after discount
  taxAmount: Decimal;
  total: Decimal; // taxableBase + taxAmount
};

export function calculateLine(input: LineCalcInput): LineCalcResult {
  const unit = toDecimal(input.unitPrice);
  const qty = new Decimal(input.quantity);
  const taxRate = toDecimal(input.taxRate ?? 0);

  const lineBase = unit.times(qty);

  let discountAmount = new Decimal(0);
  if (input.discountAmount) {
    discountAmount = toDecimal(input.discountAmount);
  } else if (input.discountRate) {
    discountAmount = lineBase.times(toDecimal(input.discountRate).dividedBy(100));
  }

  const taxableBase = lineBase.minus(discountAmount);
  const taxAmount = taxableBase.times(taxRate.dividedBy(100));
  const total = taxableBase.plus(taxAmount);

  return {
    priceNet: unit,
    lineBase: roundMoney(lineBase),
    discountAmount: roundMoney(discountAmount),
    taxableBase: roundMoney(taxableBase),
    taxAmount: roundMoney(taxAmount),
    total: roundMoney(total),
  };
}
