import { gameConfig } from "../config/gameConfig";

/**
 * チャージ量からジャンプ初速を計算する純粋関数（Phaser 非依存）
 * @param chargeRatio 0.0〜1.0（範囲外はクランプ）
 * @returns ジャンプ初速 (px/s)
 */
export function calcJumpVelocity(chargeRatio: number): number {
  const c = Math.min(Math.max(chargeRatio, 0), 1);
  return (
    gameConfig.minJumpVelocity +
    (gameConfig.maxJumpVelocity - gameConfig.minJumpVelocity) * c
  );
}

/**
 * レシート回収率スコアを計算する純粋関数
 * @param collected 収集済みレシート数
 * @param total ステージ総枚数
 * @returns 0〜100 の整数（小数点以下切り捨て）
 */
export function calcReceiptScore(collected: number, total: number): number {
  if (total === 0) return 0;
  return Math.floor((collected / total) * 100);
}

/**
 * チャージ量からプレーヤースプライトの Y 方向スケールを計算する純粋関数
 * チャージ 0% のとき scaleY = 1.0、チャージ 100% のとき scaleY = 0.7
 * @param chargeAmount 0.0〜1.0 のチャージ量
 * @returns scaleY 値 (0.7〜1.0)
 */
export function calcChargeScale(chargeAmount: number): number {
  const c = Math.min(Math.max(chargeAmount, 0), 1);
  return 1.0 - 0.3 * c;
}
