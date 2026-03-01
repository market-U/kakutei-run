import Phaser from "phaser";
import { AssetKeys, FrameCount } from "../assets/AssetKeys";
import { gameConfig } from "../config/gameConfig";
import { calcJumpVelocity, calcChargeScale } from "../systems/gameUtils";
import type { DifficultyEntry } from "../config/difficultyConfig";
import { calcWitchSlowDuration } from "../config/gameConfig";

/** プレーヤーのアニメーション状態 */
type PlayerAnim = "run" | "back_pain" | "fall" | "goal";

/** プレーヤークラス */
export class Player extends Phaser.Physics.Arcade.Sprite {
  /** ジャンプ押下開始時刻 (ms)、押していない場合は null */
  private chargeStartTime: number | null = null;
  /** 着地しているか */
  private grounded = false;
  /** 腰痛スロー中か */
  private isBackPain = false;
  /** 腰痛タイマー */
  private backPainTimer: Phaser.Time.TimerEvent | null = null;
  /** 腰痛被弾回数 */
  private witchHitCount = 0;
  /** ゲームが終了状態か（入力無効） */
  private gameOver = false;
  /** ジャンプ無効フラグ（Enemy 追跡中などに使用） */
  private jumpDisabled = false;

  private difficulty: DifficultyEntry;
  /** 敵との初期距離 (px) — GameScene からセットされる */
  private initialEnemyDistance = 0;

  private keySpace!: Phaser.Input.Keyboard.Key;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    difficulty: DifficultyEntry,
  ) {
    super(scene, x, y, AssetKeys.PLAYER_RUN);
    this.difficulty = difficulty;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 足底を Y 座標基準にする（石ころと同じ接地基準点）
    this.setOrigin(0.5, 1);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setGravityY(0); // シーン全体に重力が掛かっているので追加重力は0

    this.setDepth(10);
    this.createAnimations(scene);
  }

  // -------------------------------------------------
  // アニメーション定義
  // -------------------------------------------------
  private createAnimations(scene: Phaser.Scene): void {
    const anims = scene.anims;

    if (!anims.exists("player_run")) {
      anims.create({
        key: "player_run",
        frames: anims.generateFrameNumbers(AssetKeys.PLAYER_RUN, {
          start: 0,
          end: FrameCount.PLAYER_RUN - 1,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!anims.exists("player_back_pain")) {
      anims.create({
        key: "player_back_pain",
        frames: anims.generateFrameNumbers(AssetKeys.PLAYER_BACK_PAIN, {
          start: 0,
          end: FrameCount.PLAYER_BACK_PAIN - 1,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!anims.exists("player_fall")) {
      anims.create({
        key: "player_fall",
        frames: anims.generateFrameNumbers(AssetKeys.PLAYER_FALL, {
          start: 0,
          end: FrameCount.PLAYER_FALL - 1,
        }),
        frameRate: 10,
        repeat: 0,
      });
    }
    if (!anims.exists("player_goal")) {
      anims.create({
        key: "player_goal",
        frames: anims.generateFrameNumbers(AssetKeys.PLAYER_GOAL, {
          start: 0,
          end: FrameCount.PLAYER_GOAL - 1,
        }),
        frameRate: 8,
        repeat: 0, // 1回再生後、最終フレームに固定
      });
    }
  }

  // -------------------------------------------------
  // 入力セットアップ
  // -------------------------------------------------
  setupInput(
    keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
    input: Phaser.Input.InputPlugin,
  ): void {
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // タッチ / マウスポインター
    input.on("pointerdown", () => {
      this.startCharge();
    });
    input.on("pointerup", () => {
      this.releaseJump();
    });
  }

  setInitialEnemyDistance(distance: number): void {
    this.initialEnemyDistance = distance;
  }

  /**
   * ジャンプを無効化/有効化する（Enemy 追跡中などに使用）
   */
  setJumpDisabled(disabled: boolean): void {
    this.jumpDisabled = disabled;
    if (disabled) {
      this.chargeStartTime = null;
    }
  }

  // -------------------------------------------------
  // ジャンプ
  // -------------------------------------------------
  private startCharge(): void {
    if (this.gameOver) return;
    if (this.jumpDisabled) return;
    if (!this.grounded) return; // 空中では受け付けない
    if (this.chargeStartTime !== null) return;
    this.chargeStartTime = this.scene.time.now;
  }

  private releaseJump(): void {
    if (this.gameOver) return;
    if (this.jumpDisabled) {
      this.chargeStartTime = null;
      return;
    }
    if (this.chargeStartTime === null) return;
    if (!this.grounded) {
      this.chargeStartTime = null;
      return;
    }

    const elapsed = this.scene.time.now - this.chargeStartTime;
    const charge = Math.min(elapsed / gameConfig.maxChargeTime, 1.0);
    const velocity = calcJumpVelocity(charge);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-velocity);
    this.grounded = false;
    this.chargeStartTime = null;
    // ジャンプ発動時にアニメーションを停止し、scaleY をリセット
    this.anims.stop();
    this.setScale(1, 1);
  }

  /**
   * チャージ量 (0.0〜1.0) を計算して返す（HUD 表示などに使用）
   */
  getChargeAmount(): number {
    if (this.chargeStartTime === null) return 0;
    const elapsed = this.scene.time.now - this.chargeStartTime;
    return Math.min(elapsed / gameConfig.maxChargeTime, 1.0);
  }

  /**
   * ジャンプ初速を計算するヘルパー（gameUtils.calcJumpVelocity に委譲）
   */
  static calcJumpVelocity(chargeRatio: number): number {
    return calcJumpVelocity(chargeRatio);
  }

  // -------------------------------------------------
  // 着地
  // -------------------------------------------------
  onLanded(): void {
    this.grounded = true;
    this.chargeStartTime = null;
    this.playAnim(this.isBackPain ? "back_pain" : "run");
  }

  isOnGround(): boolean {
    return this.grounded;
  }

  // -------------------------------------------------
  // 腰痛
  // -------------------------------------------------
  activateBackPain(): void {
    if (this.gameOver) return;

    this.witchHitCount++;
    this.isBackPain = true;

    const slowDuration = calcWitchSlowDuration(
      this.difficulty,
      this.initialEnemyDistance,
    );

    // 既存タイマーをリセット
    if (this.backPainTimer) {
      this.backPainTimer.remove(false);
    }

    this.backPainTimer = this.scene.time.delayedCall(
      slowDuration * 1000,
      () => {
        this.isBackPain = false;
        this.backPainTimer = null;
        if (!this.gameOver && this.grounded) {
          this.playAnim("run");
        }
      },
    );

    this.playAnim("back_pain");

    // スクロール速度低下はイベントで通知（GameScene が処理）
    this.emit("backPainActivated", {
      hitCount: this.witchHitCount,
      slowDuration,
    });
  }

  getWitchHitCount(): number {
    return this.witchHitCount;
  }

  isBackPainActive(): boolean {
    return this.isBackPain;
  }

  // -------------------------------------------------
  // ゲームオーバー / ゴール
  // -------------------------------------------------
  triggerFall(): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.playAnim("fall");
    this.emit("fell");
  }

  triggerGoal(): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.playAnim("goal");
  }

  // -------------------------------------------------
  // アニメーション切り替え
  // -------------------------------------------------
  private playAnim(state: PlayerAnim): void {
    const key =
      state === "run"
        ? "player_run"
        : state === "back_pain"
          ? "player_back_pain"
          : state === "fall"
            ? "player_fall"
            : "player_goal";
    if (this.anims.currentAnim?.key !== key) {
      this.play(key);
    }
  }

  // -------------------------------------------------
  // 毎フレーム更新
  // -------------------------------------------------
  update(): void {
    if (this.gameOver) return;

    // キーボード入力（スペースキー）
    const spaceJustDown = Phaser.Input.Keyboard.JustDown(this.keySpace);
    const spaceJustUp = Phaser.Input.Keyboard.JustUp(this.keySpace);

    if (spaceJustDown) this.startCharge();
    if (spaceJustUp) this.releaseJump();

    // チャージ量に連動して Y 方向にスプライトを縮小（下端起点）
    const chargeAmount = this.getChargeAmount();
    if (chargeAmount > 0) {
      this.setScale(1, calcChargeScale(chargeAmount));
    } else {
      this.setScale(1, 1);
    }
  }
}
