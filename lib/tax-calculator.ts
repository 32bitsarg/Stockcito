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
  const unit = toDecimal(input.unitPrice); // PRECIO FINAL
  const qty = new Decimal(input.quantity);
  const taxRate = toDecimal(input.taxRate ?? 0);

  // 1. Total Final Bruto (antes de desc)
  const lineTotalGross = unit.times(qty);

  // 2. Calcular Descuento
  let discountAmount = new Decimal(0);
  if (input.discountAmount) {
    discountAmount = toDecimal(input.discountAmount);
  } else if (input.discountRate) {
    discountAmount = lineTotalGross.times(toDecimal(input.discountRate).dividedBy(100));
  }

  // 3. Total Final a Pagar (Total con IVA)
  const total = lineTotalGross.minus(discountAmount);

  // 4. Desglosar (Sacar IVA hacia adentro)
  // Neto = Total / (1 + Tasa)
  const taxableBase = total.dividedBy(new Decimal(1).plus(taxRate.dividedBy(100)));
  const taxAmount = total.minus(taxableBase);

  // Retro-calcular el precio unitario neto para referencia (aunque usamos el final para operar)
  const priceNet = taxableBase.dividedBy(qty);

  return {
    priceNet: roundMoney(priceNet),
    lineBase: roundMoney(lineTotalGross), // Base sobre precio final
    discountAmount: roundMoney(discountAmount),
    taxableBase: roundMoney(taxableBase),
    taxAmount: roundMoney(taxAmount),
    total: roundMoney(total),
  };
}
