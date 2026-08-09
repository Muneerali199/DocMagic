import { applyCoupons } from "./apply";

describe("applyCoupons", () => {
  it("applies a single coupon", () => {
    expect(applyCoupons({ subtotal: 100, coupons: ["SAVE10"] }, { SAVE10: 10 })).toBe(90);
  });
});
