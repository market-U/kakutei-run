import Phaser from "phaser";
import { AssetKeys, FrameCount } from "../assets/AssetKeys";
import { gameConfig } from "../config/gameConfig";

/**
 * 空中を右から左に移動する障害物。
 * 接触でプレーヤーに腰痛ペナルティを与える。
 */
export class Witch extends Phaser.GameObjects.Sprite {
  /** ワールド X 基準位置（出現時の右端からの論理位置） */
  readonly worldX: number;
  readonly worldY: number;

  /** 地面スクロール速度係数 */
  private speedFactor: number;
  /** 既にヒット済みか */
  private _consumed = false;

  constructor(scene: Phaser.Scene, worldX: number, worldY: number) {
    super(scene, worldX, worldY, AssetKeys.WITCH_FLOAT);

    this.worldX = worldX;
    this.worldY = worldY;

    // ランダム速度係数
    this.speedFactor =
      gameConfig.witchScrollSpeedFactorMin +
      Math.random() *
        (gameConfig.witchScrollSpeedFactorMax -
          gameConfig.witchScrollSpeedFactorMin);

    scene.add.existing(this);
    this.setDepth(6);
    this.createAnim(scene);
    this.play("witch_float");
  }

  private createAnim(scene: Phaser.Scene): void {
    if (!scene.anims.exists("witch_float")) {
      scene.anims.create({
        key: "witch_float",
        frames: scene.anims.generateFrameNumbers(AssetKeys.WITCH_FLOAT, {
          start: 0,
          end: FrameCount.WITCH_FLOAT - 1,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }
  }

  /**
   * 毎フレーム更新。
   * @param scrolledX 今フレームの累積スクロール量 (px)
   * @param scrollSpeed 現在の地面スクロール速度 (px/s)
   * @param delta フレーム経過時間 (ms)
   */
  updateScroll(scrolledX: number, scrollSpeed: number, delta: number): void {
    // 魔女固有の追加移動量（独自速度係数分の差分）
    const extraDx = (scrollSpeed * (this.speedFactor - 1.0) * delta) / 1000;
    this.x = this.worldX - scrolledX - extraDx;
  }

  isVisible(): boolean {
    return this.x > -100 && this.x < 1060;
  }

  consume(): void {
    this._consumed = true;
    this.setVisible(false);
    this.destroy();
  }

  isConsumed(): boolean {
    return this._consumed;
  }

  getHitBounds(): Phaser.Geom.Rectangle {
    const hw = (this.displayWidth * 0.6) / 2;
    const hh = (this.displayHeight * 0.6) / 2;
    return new Phaser.Geom.Rectangle(this.x - hw, this.y - hh, hw * 2, hh * 2);
  }
}
