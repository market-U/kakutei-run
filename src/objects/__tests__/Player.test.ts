import { describe, it, expect } from "vitest";
import { calcJumpVelocity, calcChargeScale } from "../../systems/gameUtils";
import { gameConfig } from "../../config/gameConfig";
import { PlayerStateManager } from "../PlayerStateManager";

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

// -------------------------------------------------
// PlayerStateManager: 状態遷移ユニットテスト
// -------------------------------------------------

describe("PlayerStateManager: triggerFall (S1/S2/S3/S4 → S5)", () => {
  it("9.1: triggerFall 後は gameOver=false かつ falling=true になる", () => {
    const ps = new PlayerStateManager();
    ps._setGrounded(true);
    const action = ps.triggerFall();
    expect(ps.gameOver).toBe(false);
    expect(ps.falling).toBe(true);
    expect(action).toBe("reset_scale_and_play_fall");
  });

  it("9.1: falling=true の状態で再度 triggerFall を呼んでも状態は変わらない", () => {
    const ps = new PlayerStateManager();
    ps._setFalling(true);
    const action = ps.triggerFall();
    expect(action).toBe("none");
  });

  it("9.10: triggerFall は reset_scale アクションを返す", () => {
    const ps = new PlayerStateManager();
    const action = ps.triggerFall();
    expect(action).toBe("reset_scale_and_play_fall");
  });
});

describe("PlayerStateManager: onLanded ガード (タスク 9.2, 9.3)", () => {
  it("9.2: falling=true のとき onLanded は無視される (none を返す)", () => {
    const ps = new PlayerStateManager();
    ps._setFalling(true);
    const action = ps.onLanded();
    expect(action).toBe("none");
    expect(ps.grounded).toBe(false); // grounded は変化しない
  });

  it("9.3: gameOver=true のとき onLanded は無視される (none を返す)", () => {
    const ps = new PlayerStateManager();
    ps._setGameOver(true);
    const action = ps.onLanded();
    expect(action).toBe("none");
    expect(ps.grounded).toBe(false);
  });

  it("通常着地（S3→S1）: play_run を返す", () => {
    const ps = new PlayerStateManager();
    const action = ps.onLanded();
    expect(action).toBe("play_run");
    expect(ps.grounded).toBe(true);
  });
});

describe("PlayerStateManager: onLanded アニメーション再起動 (タスク 9.4, 9.5)", () => {
  it("9.4: 着地後に grounded=true となり play_run が返される（同アニメ再起動）", () => {
    const ps = new PlayerStateManager();
    // ジャンプ後の着地（S3→S1）
    ps.onJump();
    const action = ps.onLanded();
    expect(action).toBe("play_run");
    expect(ps.grounded).toBe(true);
  });

  it("9.5: isBackPain=true で着地（S4→S2）したとき play_back_pain が返される", () => {
    const ps = new PlayerStateManager();
    ps._setBackPain(true);
    const action = ps.onLanded();
    expect(action).toBe("play_back_pain");
    expect(ps.grounded).toBe(true);
  });
});

describe("PlayerStateManager: activateBackPain 空中被弾 (タスク 9.6)", () => {
  it("9.6: 空中（grounded=false）で activateBackPain を呼ぶと play_back_pain_frame0 が返される (S3→S4)", () => {
    const ps = new PlayerStateManager();
    // grounded=false（デフォルト）のまま
    const action = ps.activateBackPain();
    expect(action).toBe("play_back_pain_frame0");
    expect(ps.isBackPain).toBe(true);
  });

  it("地上（grounded=true）で activateBackPain を呼ぶと play_back_pain が返される (S1→S2)", () => {
    const ps = new PlayerStateManager();
    ps._setGrounded(true);
    const action = ps.activateBackPain();
    expect(action).toBe("play_back_pain");
    expect(ps.isBackPain).toBe(true);
  });
});

describe("PlayerStateManager: deactivateBackPain タイマー満了 (タスク 9.7)", () => {
  it("9.7: 空中（grounded=false）でタイマー満了すると isBackPain=false になり sprite 変更なし (S4→S3)", () => {
    const ps = new PlayerStateManager();
    ps._setBackPain(true);
    // grounded=false のまま
    const action = ps.deactivateBackPain();
    expect(ps.isBackPain).toBe(false);
    expect(action).toBe("none"); // sprite 変更なし
  });

  it("地上でタイマー満了すると play_run が返される (S2→S1)", () => {
    const ps = new PlayerStateManager();
    ps._setGrounded(true);
    ps._setBackPain(true);
    const action = ps.deactivateBackPain();
    expect(ps.isBackPain).toBe(false);
    expect(action).toBe("play_run");
  });
});

describe("PlayerStateManager: triggerEnemyCaught (タスク 9.8, 9.9)", () => {
  it("9.8: falling=false のとき triggerEnemyCaught は gameOver=true になり reset_scale_and_play_goal を返す (S1→S7)", () => {
    const ps = new PlayerStateManager();
    ps._setGrounded(true);
    const action = ps.triggerEnemyCaught();
    expect(ps.gameOver).toBe(true);
    expect(action).toBe("reset_scale_and_play_goal");
  });

  it("9.9: falling=true のとき triggerEnemyCaught は gameOver=true になるが sprite 変更なし (S5→S7)", () => {
    const ps = new PlayerStateManager();
    ps._setFalling(true);
    const action = ps.triggerEnemyCaught();
    expect(ps.gameOver).toBe(true);
    expect(action).toBe("none"); // player_fall 最終フレームを維持
  });

  it("gameOver=true の状態で再度呼んでも何も起きない", () => {
    const ps = new PlayerStateManager();
    ps._setGameOver(true);
    const action = ps.triggerEnemyCaught();
    expect(action).toBe("none");
  });
});

describe("PlayerStateManager: triggerGoal (タスク 9.10)", () => {
  it("9.10: triggerGoal は reset_scale アクションを返す", () => {
    const ps = new PlayerStateManager();
    const action = ps.triggerGoal();
    expect(action).toBe("reset_scale_and_play_goal");
    expect(ps.gameOver).toBe(true);
  });

  it("gameOver=true の状態で triggerGoal を呼んでも何も起きない", () => {
    const ps = new PlayerStateManager();
    ps._setGameOver(true);
    const action = ps.triggerGoal();
    expect(action).toBe("none");
  });
});

describe("PlayerStateManager: 状態遷移の組み合わせシナリオ", () => {
  it("S1→S3→S1: ジャンプ→着地でグラウンド状態が正しく復元される", () => {
    const ps = new PlayerStateManager();
    ps._setGrounded(true);
    ps.onJump();
    expect(ps.grounded).toBe(false);
    const action = ps.onLanded();
    expect(ps.grounded).toBe(true);
    expect(action).toBe("play_run");
  });

  it("S5→S7: triggerFall 後に triggerEnemyCaught を呼ぶと falling フレームを維持", () => {
    const ps = new PlayerStateManager();
    ps.triggerFall();
    expect(ps.falling).toBe(true);
    expect(ps.gameOver).toBe(false);
    const action = ps.triggerEnemyCaught();
    expect(ps.gameOver).toBe(true);
    expect(action).toBe("none");
  });

  it("S5中の着地・石接触は無視される", () => {
    const ps = new PlayerStateManager();
    ps.triggerFall(); // → S5
    const landAction = ps.onLanded();
    expect(landAction).toBe("none");
    const fallAction = ps.triggerFall(); // 再度の石接触
    expect(fallAction).toBe("none");
  });
});
