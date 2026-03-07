/** アセットキー定数の一元管理 */
export const AssetKeys = {
  // --- Spritesheets ---
  PLAYER_RUN: "player_run",
  PLAYER_FALL: "player_fall",
  PLAYER_GOAL: "player_goal",
  PLAYER_BACK_PAIN: "player_back_pain",
  ENEMY_RUN: "enemy_run",
  WITCH_FLOAT: "witch_float",
  RECEIPT: "receipt",

  // --- Static images ---
  TAX_OFFICE: "tax_office",
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
  ENEMY: { width: 96, height: 144 },
  /** 魔女フレームサイズ (px) */
  WITCH: { width: 64, height: 64 },
  /** レシートフレームサイズ (px) */
  RECEIPT: { width: 32, height: 48 },
} as const;

/** 各スプライトシートのフレーム数 */
export const FrameCount = {
  PLAYER_RUN: 6,
  PLAYER_FALL: 5,
  PLAYER_GOAL: 5,
  PLAYER_BACK_PAIN: 6,
  ENEMY_RUN: 6,
  WITCH_FLOAT: 4,
  RECEIPT: 1,
} as const;
