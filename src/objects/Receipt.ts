import Phaser from "phaser";
import { AssetKeys, FrameCount } from "../assets/AssetKeys";
import { gameConfig } from "../config/gameConfig";
import { ScrollableSprite } from "./ScrollableSprite";

/** 収集可能なレシートアイテム */
export class Receipt extends ScrollableSprite {
  /** 収集済みか */
  private _collected = false;

  constructor(scene: Phaser.Scene, worldX: number, worldY: number) {
    super(
      scene,
      worldX,
      worldY,
      AssetKeys.RECEIPT,
      gameConfig.receiptSpeedFactorMin,
      gameConfig.receiptSpeedFactorMax,
    );

    scene.add.existing(this);
    this.setDepth(5);
    this.createAnim(scene);
    this.play("receipt_float");

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

  private createAnim(scene: Phaser.Scene): void {
    if (!scene.anims.exists("receipt_float")) {
      scene.anims.create({
        key: "receipt_float",
        frames: scene.anims.generateFrameNumbers(AssetKeys.RECEIPT, {
          start: 0,
          end: FrameCount.RECEIPT - 1,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }
  }

  getHitBounds(): Phaser.Geom.Rectangle {
    const hw = this.displayWidth / 2;
    const hh = this.displayHeight / 2;
    return new Phaser.Geom.Rectangle(this.x - hw, this.y - hh, hw * 2, hh * 2);
  }
}
