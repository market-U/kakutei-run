import Phaser from "phaser";
import { AssetKeys } from "../assets/AssetKeys";
import {
  CANVAS_W,
  GAME_ZONE_Y,
  GAME_ZONE_HEIGHT,
} from "../config/canvasConfig";

/** 視差スクロールの速度係数 */
const PARALLAX = {
  FAR: 0.3,
  NEAR: 0.7,
  GROUND: 1.0,
} as const;

/** 地面の高さ (px) — ゲームゾーン内のローカル座標 */
export const GROUND_HEIGHT = 64;
/** 地面の Y 座標 (上端) — ゲームゾーン内のローカル座標 */
export const GROUND_Y = GAME_ZONE_HEIGHT - GROUND_HEIGHT;

/**
 * 3レイヤー視差スクロールを管理するシステム
 * - 遠景 (bg_far):  速度 × 0.3
 * - 近景 (bg_near): 速度 × 0.7
 * - 地面 (ground):  速度 × 1.0
 *
 * 背景はゲームプレイゾーン（y=GAME_ZONE_Y, 高さ=GAME_ZONE_HEIGHT）内に描画される
 */
export class ScrollManager {
  private bgFar: Phaser.GameObjects.TileSprite;
  private bgNear: Phaser.GameObjects.TileSprite;
  private ground: Phaser.GameObjects.TileSprite;

  /** 現在のスクロール速度 (px/s) */
  private scrollSpeed: number;
  /** スクロールが有効か */
  private active = true;

  constructor(scene: Phaser.Scene, scrollSpeed: number) {
    this.scrollSpeed = scrollSpeed;

    // 遠景 (最背面) — ゲームゾーン内に配置
    this.bgFar = scene.add
      .tileSprite(0, GAME_ZONE_Y, CANVAS_W, GAME_ZONE_HEIGHT, AssetKeys.BG_FAR)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(0);

    // 近景 — ゲームゾーン内に配置
    this.bgNear = scene.add
      .tileSprite(0, GAME_ZONE_Y, CANVAS_W, GAME_ZONE_HEIGHT, AssetKeys.BG_NEAR)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(1);

    // 地面 — ゲームゾーン内の GROUND_Y にオフセット加算
    this.ground = scene.add
      .tileSprite(
        0,
        GROUND_Y + GAME_ZONE_Y,
        CANVAS_W,
        GROUND_HEIGHT,
        AssetKeys.GROUND,
      )
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(2);
  }

  update(delta: number): void {
    if (!this.active) return;
    const dx = (this.scrollSpeed * delta) / 1000;
    this.bgFar.tilePositionX += dx * PARALLAX.FAR;
    this.bgNear.tilePositionX += dx * PARALLAX.NEAR;
    this.ground.tilePositionX += dx * PARALLAX.GROUND;
  }

  /** スクロールを停止する */
  stop(): void {
    this.active = false;
  }

  /** スクロールを再開する */
  resume(): void {
    this.active = true;
  }

  setSpeed(speed: number): void {
    this.scrollSpeed = speed;
  }

  getSpeed(): number {
    return this.scrollSpeed;
  }
}
