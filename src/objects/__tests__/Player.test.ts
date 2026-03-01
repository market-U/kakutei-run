import { describe, it, expect } from "vitest";
import { calcJumpVelocity } from "../../systems/gameUtils";
import { gameConfig } from "../../config/gameConfig";

describe("calcJumpVelocity", () => {
  it("チャージ0のとき minJumpVelocity を返す", () => {
    expect(calcJumpVelocity(0)).toBe(gameConfig.minJumpVelocity);
  });

  it("チャージ1のとき maxJumpVelocity を返す", () => {
    expect(calcJumpVelocity(1)).toBe(gameConfig.maxJumpVelocity);
  });

  it("チャージ0.5のとき中間値を返す", () => {
    const expected =
      gameConfig.minJumpVelocity +
      (gameConfig.maxJumpVelocity - gameConfig.minJumpVelocity) * 0.5;
    expect(calcJumpVelocity(0.5)).toBeCloseTo(expected);
  });

  it("チャージが1を超えても maxJumpVelocity にクランプされる", () => {
    expect(calcJumpVelocity(2)).toBe(gameConfig.maxJumpVelocity);
  });

  it("チャージが負の値でも minJumpVelocity にクランプされる", () => {
    expect(calcJumpVelocity(-0.5)).toBe(gameConfig.minJumpVelocity);
  });
});
