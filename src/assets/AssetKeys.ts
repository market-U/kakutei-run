/** アセットキー定数の一元管理 */
export const AssetKeys = {
  // --- Spritesheets ---
  PLAYER_RUN: "player_run",
  PLAYER_FALL: "player_fall",
  PLAYER_GOAL: "player_goal",
  PLAYER_BACK_PAIN: "player_back_pain",
  ENEMY_RUN: "enemy_run",
  WITCH_FLOAT: "witch_float",

  // --- Static images ---
  TAX_OFFICE: "tax_office",
  RECEIPT_1: "receipt_1",
  RECEIPT_2: "receipt_2",
  RECEIPT_3: "receipt_3",
  STONE_1: "stone_1",
  STONE_2: "stone_2",
  STONE_3: "stone_3",
  BG_FAR: "bg_far",
  BG_NEAR: "bg_near",
  GROUND: "ground",
} as const;

export type AssetKey = (typeof AssetKeys)[keyof typeof AssetKeys];

/** スプライトシートのフレームサイズ定数 */
export const FrameSize = {
  /** プレーヤー共通フレームサイズ (px) */
  PLAYER: { width: 64, height: 96 },
  /** 敵キャラフレームサイズ (px) */
  ENEMY: { width: 64, height: 96 },
  /** 魔女フレームサイズ (px) */
  WITCH: { width: 64, height: 64 },
} as const;

/** 各スプライトシートのフレーム数 */
export const FrameCount = {
  PLAYER_RUN: 6,
  PLAYER_FALL: 5,
  PLAYER_GOAL: 5,
  PLAYER_BACK_PAIN: 6,
  ENEMY_RUN: 6,
  WITCH_FLOAT: 4,
} as const;
