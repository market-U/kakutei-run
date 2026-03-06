import Phaser from "phaser";
import { AssetKeys } from "../assets/AssetKeys";
import { gameConfig } from "../config/gameConfig";

const RECEIPT_KEYS = [
  AssetKeys.RECEIPT_1,
  AssetKeys.RECEIPT_2,
  AssetKeys.RECEIPT_3,
] as const;

/** 収集可能なレシートアイテム */
export class Receipt extends Phaser.GameObjects.Image {
  readonly worldX: number;
  readonly worldY: number;

  /** 地面スクロール速度係数 */
  private speedFactor: number;
  /** 速度係数による累積移動量 (px) */
  private extraScrolledX = 0;
  /** 画面にフレームインしたか */
  private _hasFramedIn = false;
  /** 収集済みか */
  private _collected = false;

  constructor(scene: Phaser.Scene, worldX: number, worldY: number) {
    const key = RECEIPT_KEYS[Math.floor(Math.random() * RECEIPT_KEYS.length)];
    super(scene, worldX, worldY, key);

    this.worldX = worldX;
    this.worldY = worldY;

    // ランダム速度係数
    this.speedFactor =
      gameConfig.receiptSpeedFactorMin +
      Math.random() *
        (gameConfig.receiptSpeedFactorMax - gameConfig.receiptSpeedFactorMin);

    scene.add.existing(this);
    this.setDepth(5);
  }

  updateScroll(scrolledX: number, scrollSpeed: number, delta: number): void {
    const baseX = this.worldX - scrolledX;
    if (!this._hasFramedIn) {
      this.x = baseX;
      if (this.isVisible()) {
        this._hasFramedIn = true;
      }
      return;
    }
    // フレームイン後のみ速度係数による差分を累積する
    this.extraScrolledX += (scrollSpeed * (this.speedFactor - 1.0) * delta) / 1000;
    this.x = baseX - this.extraScrolledX;
  }

  isVisible(): boolean {
    return this.x > -60 && this.x < 1020;
  }

  collect(): void {
    this._collected = true;
    this.setVisible(false);
    this.destroy();
  }

  isCollected(): boolean {
    return this._collected;
  }

  getHitBounds(): Phaser.Geom.Rectangle {
    const hw = this.displayWidth / 2;
    const hh = this.displayHeight / 2;
    return new Phaser.Geom.Rectangle(this.x - hw, this.y - hh, hw * 2, hh * 2);
  }
}
