/**
 * キャンバスサイズとゲームゾーン定数
 *
 * Phaser キャンバスはゲームゾーン（960×540）のみを描画する。
 * タイトル・リザルト・HUD は HTML UI 層（index.html）で実装される。
 *
 * 縦横画面の切り替えはキャンバスリサイズではなく Scale.FIT の自動スケーリングで対応。
 * デバイスを横向きにすると Scale.FIT が 960×540 を画面いっぱいに拡大する。
 */

/** キャンバス横幅 (px) */
export const CANVAS_W = 960;
/** キャンバス高さ (px) — ゲームゾーンのみ（常時この値を使用） */
export const CANVAS_H = 540;

/** ゲームプレイゾーン開始Y座標 (px) — キャンバス上端から開始 */
export const GAME_ZONE_Y = 0;
/** ゲームプレイゾーンの高さ (px) */
export const GAME_ZONE_HEIGHT = 540;
