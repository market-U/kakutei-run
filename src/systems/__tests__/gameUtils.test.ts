import { describe, it, expect } from "vitest";
import { calcReceiptScore } from "../gameUtils";

describe("calcReceiptScore", () => {
  it("全枚数収集した場合は 100 を返す", () => {
    expect(calcReceiptScore(10, 10)).toBe(100);
  });

  it("0枚収集した場合は 0 を返す", () => {
    expect(calcReceiptScore(0, 10)).toBe(0);
  });

  it("半分収集した場合は 50 を返す", () => {
    expect(calcReceiptScore(5, 10)).toBe(50);
  });

  it("小数点以下を切り捨てる", () => {
    // 7/15 = 0.4666... → 46
    expect(calcReceiptScore(7, 15)).toBe(46);
  });

  it("totalが0のとき 0 を返す（ゼロ除算防止）", () => {
    expect(calcReceiptScore(0, 0)).toBe(0);
  });
});
