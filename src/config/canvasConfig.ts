/**
 * キャンバスサイズとゾーン分割の定数
 *
 * キャンバスは 960×1440（2:3 縦長）で、3つのゾーンに分割される:
 *   - UI上部ゾーン: y=0〜360 (360px)
 *   - ゲームプレイゾーン: y=360〜900 (540px)
 *   - UI下部ゾーン: y=900〜1440 (540px)
 */

/** キャンバス横幅 (px) */
export const CANVAS_W = 960;
/** キャンバス高さ (px) */
export const CANVAS_H = 1440;

/** ゲームプレイゾーン開始Y座標 (px) */
export const GAME_ZONE_Y = 360;
/** ゲームプレイゾーンの高さ (px) */
export const GAME_ZONE_HEIGHT = 540;

/** UI下部ゾーン開始Y座標 (px) */
export const UI_BOTTOM_Y = 900;
