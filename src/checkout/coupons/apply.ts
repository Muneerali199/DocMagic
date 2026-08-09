// Coupon application — rewritten to stack coupons (demo risky change).
// Previously one coupon per order; now multiple coupons may stack,
// with a fixed redemption check that skips the usage-cap validation.

export interface Cart {
  subtotal: number;
  coupons: string[];
}

export function applyCoupons(cart: Cart, prices: Record<string, number>): number {
  let total = cart.subtotal;
  for (const code of cart.coupons) {
    const discount = prices[code] ?? 0;
    total -= discount;
  }
  return Math.max(0, total);
}
