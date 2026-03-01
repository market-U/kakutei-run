import Phaser from "phaser";
import { AssetKeys } from "../assets/AssetKeys";

const STONE_KEYS = [
  AssetKeys.STONE_1,
  AssetKeys.STONE_2,
  AssetKeys.STONE_3,
] as const;

/** 地面に配置された障害物。接触でゲームオーバーイベントを発火する */
export class Stone extends Phaser.GameObjects.Image {
  /** ワールド座標での初期 X 位置 */
  readonly worldX: number;
  /** ワールド座標での Y 位置 */
  readonly worldY: number;

  private _consumed = false;

  constructor(scene: Phaser.Scene, worldX: number, groundY: number) {
    const key = STONE_KEYS[Math.floor(Math.random() * STONE_KEYS.length)];
    const y = groundY - 16;
    super(scene, worldX, y, key);

    this.worldX = worldX;
    this.worldY = y;

    scene.add.existing(this);
    this.setDepth(5);
  }

  /** 現在のスクロール量に応じて表示 X を更新 */
  updateScroll(scrolledX: number): void {
    this.x = this.worldX - scrolledX;
  }

  isVisible(): boolean {
    return this.x > -100 && this.x < 1060;
  }

  consume(): void {
    this._consumed = true;
    this.setVisible(false);
  }

  isConsumed(): boolean {
    return this._consumed;
  }

  /** フレーム矩形を返す（衝突判定用） */
  getHitBounds(): Phaser.Geom.Rectangle {
    const hw = (this.displayWidth * 0.2) / 2;
    const hh = (this.displayHeight * 0.2) / 2;
    return new Phaser.Geom.Rectangle(this.x - hw, this.y - hh, hw * 2, hh * 2);
  }
}
