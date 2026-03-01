import { describe, it, expect } from "vitest";
import { calcJumpVelocity, calcChargeScale } from "../../systems/gameUtils";
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

/**
 * Player スプライト Y スケール縮小（ジャンプチャージ演出）
 *
 * 実装: Player.update() 内で calcChargeScale(chargeAmount) を用いて scaleY を設定。
 * ジャンプ発動時（releaseJump）は anims.stop() と setScale(1,1) を呼び出してリセット。
 * これらの Phaser オブジェクト依存の呼び出しは統合テスト・手動テストで確認する。
 */
describe("calcChargeScale（Playerチャージ縮小演出のスケール計算）", () => {
  it("チャージなし（0）のとき scaleY は 1.0", () => {
    expect(calcChargeScale(0)).toBeCloseTo(1.0);
  });

  it("チャージ最大（1.0）のとき scaleY は 0.7", () => {
    expect(calcChargeScale(1)).toBeCloseTo(0.7);
  });

  it("チャージ中間（0.5）のとき scaleY は 0.85", () => {
    expect(calcChargeScale(0.5)).toBeCloseTo(0.85);
  });

  it("チャージが範囲外（>1）でも scaleY は 0.7 にクランプされる", () => {
    expect(calcChargeScale(1.5)).toBeCloseTo(0.7);
  });
});
