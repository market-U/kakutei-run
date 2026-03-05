import { describe, it, expect } from "vitest";
import { calcReceiptScore, calcChargeScale, calcChargeScaleX } from "../gameUtils";

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

describe("calcChargeScale", () => {
  it("チャージ0のとき scaleY は 1.0", () => {
    expect(calcChargeScale(0)).toBeCloseTo(1.0);
  });

  it("チャージ1のとき scaleY は 0.8", () => {
    expect(calcChargeScale(1)).toBeCloseTo(0.8);
  });

  it("チャージ0.5のとき scaleY は 0.9", () => {
    expect(calcChargeScale(0.5)).toBeCloseTo(0.9);
  });

  it("チャージが1を超えても 0.8 にクランプされる", () => {
    expect(calcChargeScale(2)).toBeCloseTo(0.8);
  });

  it("チャージが負の値でも 1.0 にクランプされる", () => {
    expect(calcChargeScale(-0.5)).toBeCloseTo(1.0);
  });
});

describe("calcChargeScaleX", () => {
  it("チャージ0のとき scaleX は 1.0", () => {
    expect(calcChargeScaleX(0)).toBeCloseTo(1.0);
  });

  it("チャージ1のとき scaleX は 1.2", () => {
    expect(calcChargeScaleX(1)).toBeCloseTo(1.2);
  });

  it("チャージ0.5のとき scaleX は 1.1", () => {
    expect(calcChargeScaleX(0.5)).toBeCloseTo(1.1);
  });

  it("チャージが1を超えても 1.2 にクランプされる", () => {
    expect(calcChargeScaleX(2)).toBeCloseTo(1.2);
  });

  it("チャージが負の値でも 1.0 にクランプされる", () => {
    expect(calcChargeScaleX(-0.5)).toBeCloseTo(1.0);
  });
});
