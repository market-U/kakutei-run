import Phaser from "phaser";
import { AssetKeys, FrameCount } from "../assets/AssetKeys";
import { gameConfig } from "../config/gameConfig";

const CANVAS_WIDTH = 960;

/**
 * 画面左端にチラ見えする敵キャラクター。
 * 石ころ転倒またはゲームオーバー時に画面中央に向かって移動する。
 */
export class Enemy extends Phaser.GameObjects.Sprite {
  /** プレーヤーとの現在の距離 (px) ―― 画面左端からの論理オフセット */
  private currentDistance: number;
  /** 初期距離 */
  private _initialDistance: number;
  /** 追跡（突進）モード */
  private chasing = false;
  /** 停止状態（衝突後にその場で静止） */
  private stopped = false;
  /** 漸近移動中か */
  private approaching = false;
  /** 漸近移動の目標距離 */
  private targetDistance = 0;
  /** 漸近移動速度 (px/s) */
  private approachSpeed = 0;

  constructor(scene: Phaser.Scene, initialDistance: number) {
    // 画面左端より外側に配置
    super(scene, -32, 0, AssetKeys.ENEMY_RUN);

    this.currentDistance = initialDistance;
    this._initialDistance = initialDistance;
    scene.add.existing(this);
    this.setDepth(11);
    this.setOrigin(0.5, 1);

    this.createAnim(scene);
    this.play("enemy_run");
    this.updateVisualPosition();
  }

  private createAnim(scene: Phaser.Scene): void {
    if (!scene.anims.exists("enemy_run")) {
      scene.anims.create({
        key: "enemy_run",
        frames: scene.anims.generateFrameNumbers(AssetKeys.ENEMY_RUN, {
          start: 0,
          end: FrameCount.ENEMY_RUN - 1,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  /**
   * 魔女被弾1回分の距離縮小を適用する。
   * duration 秒かけて漸近的に近づく。
   */
  applyWitchHit(duration: number): void {
    const reduction = this._initialDistance * gameConfig.witchDistanceFraction;
    this.targetDistance = Math.max(0, this.currentDistance - reduction);
    const remaining = this.currentDistance - this.targetDistance;
    if (duration > 0 && remaining > 0) {
      this.approachSpeed = remaining / duration;
      this.approaching = true;
    } else {
      this.currentDistance = this.targetDistance;
      this.approaching = false;
      this.updateVisualPosition();
    }
  }

  /**
   * 石ころ転倒など、即座にプレーヤーに追い付かせる
   */
  startChasing(): void {
    this.chasing = true;
    this.approaching = false;
  }

  /**
   * 追跡を停止し、現在位置で静止させる
   */
  stopChasing(): void {
    this.chasing = false;
    this.stopped = true;
    // 到達後はアニメーションを停止
    this.anims.stop();
  }

  /**
   * 追跡中かどうかを返す
   */
  isChasing(): boolean {
    return this.chasing;
  }

  update(delta: number): void {
    if (this.stopped) return;
    if (this.chasing) {
      // 画面中央 (= プレーヤー X) に向けて移動
      const targetX = CANVAS_WIDTH / 2;
      const speed = 600;
      const dx = (speed * delta) / 1000;
      if (this.x < targetX) {
        this.x = Math.min(this.x + dx, targetX);
      }
    } else if (this.approaching) {
      const step = (this.approachSpeed * delta) / 1000;
      this.currentDistance = Math.max(
        this.targetDistance,
        this.currentDistance - step,
      );
      if (this.currentDistance <= this.targetDistance) {
        this.currentDistance = this.targetDistance;
        this.approaching = false;
      }
      this.updateVisualPosition();
    } else {
      this.updateVisualPosition();
    }
  }

  /**
   * 距離に応じた画面 X 位置に更新する
   * distance が 0 → 画面左端ぴったり
   * distance が large → 画面外左に消える
   */
  private updateVisualPosition(): void {
    // プレーヤーの画面X = CANVAS_WIDTH/2
    const playerScreenX = CANVAS_WIDTH / 2;
    this.x = playerScreenX - this.currentDistance;
  }

  getCurrentDistance(): number {
    return this.currentDistance;
  }

  getHitBounds(): Phaser.Geom.Rectangle {
    const hw = (this.displayWidth * 0.8) / 2;
    const hh = (this.displayHeight * 0.8) / 2;
    return new Phaser.Geom.Rectangle(this.x - hw, this.y - hh, hw * 2, hh * 2);
  }
}
