import Phaser from "phaser";
import { AssetKeys, FrameCount } from "../assets/AssetKeys";
import { gameConfig } from "../config/gameConfig";
import { ScrollableSprite } from "./ScrollableSprite";

/**
 * 空中を右から左に移動する障害物。
 * 接触でプレーヤーに腰痛ペナルティを与える。
 */
export class Witch extends ScrollableSprite {
  /** 既にヒット済みか */
  private _consumed = false;

  constructor(scene: Phaser.Scene, worldX: number, worldY: number) {
    super(
      scene,
      worldX,
      worldY,
      AssetKeys.WITCH_FLOAT,
      gameConfig.witchScrollSpeedFactorMin,
      gameConfig.witchScrollSpeedFactorMax,
    );

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
    const hw = (this.displayWidth * 0.5) / 2;
    const hh = (this.displayHeight * 0.5) / 2;
    return new Phaser.Geom.Rectangle(this.x - hw, this.y - hh, hw * 2, hh * 2);
  }
}
