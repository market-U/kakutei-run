import Phaser from "phaser";
import { AssetKeys } from "../assets/AssetKeys";
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
