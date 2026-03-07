import Phaser from "phaser";

/**
 * スクロール連動オブジェクトの共通基底クラス。
 * Witch・Receipt など画面右から左へ移動するオブジェクトが継承する。
 */
export abstract class ScrollableSprite extends Phaser.GameObjects.Sprite {
  /** ワールド X 基準位置 */
  readonly worldX: number;
  readonly worldY: number;

  /** 地面スクロール速度係数 */
  private speedFactor: number;
  /** 速度係数による累積移動量 (px) */
  private extraScrolledX = 0;
  /** 画面にフレームインしたか */
  private _hasFramedIn = false;

  constructor(
    scene: Phaser.Scene,
    worldX: number,
    worldY: number,
    textureKey: string,
    speedFactorMin: number,
    speedFactorMax: number,
  ) {
    super(scene, worldX, worldY, textureKey);
    this.worldX = worldX;
    this.worldY = worldY;
    this.speedFactor =
      speedFactorMin + Math.random() * (speedFactorMax - speedFactorMin);
  }

  /**
   * 毎フレーム更新。
   * @param scrolledX 今フレームの累積スクロール量 (px)
   * @param scrollSpeed 現在の地面スクロール速度 (px/s)
   * @param delta フレーム経過時間 (ms)
   */
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

  abstract isVisible(): boolean;
  abstract getHitBounds(): Phaser.Geom.Rectangle;
}
