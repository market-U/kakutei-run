import type { DifficultyEntry } from "./difficultyConfig";

/**
 * 難易度によらない物理・ゲームパラメータ
 * チューニングはここを変更するだけで全体に反映される
 */
export const gameConfig = {
  // ---- 物理 ----
  /** 重力加速度 (px/s²) */
  gravity: 2200,

  // ---- ジャンプ ----
  /** チャージなし(タップ)時のジャンプ初速 (px/s, 上方向) */
  minJumpVelocity: 400,
  /** フルチャージ時のジャンプ初速 (px/s, 上方向) */
  maxJumpVelocity: 1200,
  /** フルチャージに要する時間 (ms) */
  maxChargeTime: 800,

  // ---- 魔女 腰痛ペナルティ ----
  /**
   * 魔女被弾時のスクロール速度低下割合 (0〜1)
   * 例: 0.2 → 20% 低下
   */
  witchSpeedReduction: 0.25,
  /**
   * 魔女1回被弾で縮まる敵との距離の割合 (0〜1)
   * 3回で追い付かれる場合は 1/3 ≒ 0.333
   */
  witchDistanceFraction: 1 / 3,

  // ---- 魔女 出現・移動 ----
  /** 魔女のスクロール速度係数 最小値 */
  witchScrollSpeedFactorMin: 0.8,
  /** 魔女のスクロール速度係数 最大値 */
  witchScrollSpeedFactorMax: 1.2,
  /** 魔女の出現 Y 座標 最小値 (px, 上端が0) */
  witchYMin: 80,
  /** 魔女の出現 Y 座標 最大値 (px) */
  witchYMax: 360,

  // ---- レシート 出現・移動 ----
  /** レシートのスクロール速度係数 最小値 */
  receiptSpeedFactorMin: 0.8,
  /** レシートのスクロール速度係数 最大値 */
  receiptSpeedFactorMax: 1.2,
  /** レシートの出現 Y 座標 最小値 (px) */
  receiptYMin: 100,
  /** レシートの出現 Y 座標 最大値 (px) */
  receiptYMax: 460,

  // ---- オブジェクト配置間隔 ----
  /**
   * 配置時点での全オブジェクト間の最小直線距離 (px)
   * レシート同士・魔女同士・レシート↔魔女すべてに適用
   * 配置時チェックのみ。移動後の重なりは許容する
   */
  objectMinDistance: 150,
} as const;

export type GameConfig = typeof gameConfig;

/**
 * 魔女スロー継続時間を自動計算する
 * witchSlowDuration = (initialEnemyDistance × witchDistanceFraction) / (scrollSpeed × witchSpeedReduction)
 *
 * 「1回被弾で縮まる距離分をスローで走り切る時間」という設計式
 *
 * @param difficulty 使用中の難易度エントリ
 * @param initialEnemyDistance 初期の敵との距離 (px)
 */
export function calcWitchSlowDuration(
  difficulty: Pick<DifficultyEntry, "scrollSpeed">,
  initialEnemyDistance: number,
): number {
  const reducedDistance =
    initialEnemyDistance * gameConfig.witchDistanceFraction;
  const reducedSpeed = difficulty.scrollSpeed * gameConfig.witchSpeedReduction;
  return reducedDistance / reducedSpeed;
}
