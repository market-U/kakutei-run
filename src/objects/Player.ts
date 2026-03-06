import Phaser from "phaser";
import { AssetKeys, FrameCount } from "../assets/AssetKeys";
import { gameConfig } from "../config/gameConfig";
import { calcJumpVelocity, calcChargeScaleY, calcChargeScaleX } from "../systems/gameUtils";
import type { DifficultyEntry } from "../config/difficultyConfig";
import { calcWitchSlowDuration } from "../config/gameConfig";
import { PlayerStateManager } from "./PlayerStateManager";

/** プレーヤーのアニメーション状態 */
type PlayerAnim = "run" | "back_pain" | "fall" | "goal";

/** プレーヤークラス */
export class Player extends Phaser.Physics.Arcade.Sprite {
  /** 状態管理 */
  private ps = new PlayerStateManager();
  /** ジャンプ押下開始時刻 (ms)、押していない場合は null */
  private chargeStartTime: number | null = null;
  /** 腰痛タイマー */
  private backPainTimer: Phaser.Time.TimerEvent | null = null;
  /** 腰痛被弾回数 */
  private witchHitCount = 0;
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
        repeat: -1, // ループ再生
      });
    }
  }

  // -------------------------------------------------
  // 入力セットアップ
  // -------------------------------------------------
  setupInput(keyboard: Phaser.Input.Keyboard.KeyboardPlugin): void {
    this.keySpace = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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
  startCharge(): void {
    if (this.ps.gameOver) return;
    if (this.jumpDisabled) return;
    if (!this.ps.grounded) {
      this.ps.onPressInAir(); // 空中入力は着地時チャージのバッファとして登録
      return;
    }
    if (this.chargeStartTime !== null) return;
    this.chargeStartTime = this.scene.time.now;
  }

  releaseJump(): void {
    if (this.ps.gameOver) return;
    if (this.jumpDisabled) {
      this.chargeStartTime = null;
      this.ps.onReleaseInAir();
      return;
    }
    if (this.chargeStartTime === null) {
      // 空中でリリースした場合はバッファをキャンセル
      this.ps.onReleaseInAir();
      return;
    }
    if (!this.ps.grounded) {
      this.chargeStartTime = null;
      return;
    }

    const elapsed = this.scene.time.now - this.chargeStartTime;
    const charge = Math.min(elapsed / gameConfig.maxChargeTime, 1.0);
    const velocity = calcJumpVelocity(charge);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-velocity);
    this.ps.onJump();
    this.chargeStartTime = null;
    // ジャンプ発動時にアニメーションを停止し、scale をリセット
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
    const action = this.ps.onLanded();
    if (action === "none") return;
    this.chargeStartTime = null;
    // 空中入力のバッファがあれば着地時刻にチャージ開始
    const shouldCharge = this.ps.consumePendingCharge();
    if (shouldCharge && !this.jumpDisabled) {
      this.chargeStartTime = this.scene.time.now;
    }
    this.playAnim(action === "play_back_pain" ? "back_pain" : "run");
  }

  isOnGround(): boolean {
    return this.ps.grounded;
  }

  // -------------------------------------------------
  // 腰痛
  // -------------------------------------------------
  activateBackPain(): void {
    const action = this.ps.activateBackPain();
    if (action === "none") return;

    this.witchHitCount++;

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
        this.backPainTimer = null;
        const timerAction = this.ps.deactivateBackPain();
        if (timerAction === "play_run") {
          this.playAnim("run");
        }
      },
    );

    if (action === "play_back_pain") {
      this.playAnim("back_pain");
    } else {
      // 空中被弾: back_pain の 1フレーム目を表示して停止
      this.play("player_back_pain");
      this.anims.stop();
    }

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
    return this.ps.isBackPain;
  }

  // -------------------------------------------------
  // ゲームオーバー / ゴール
  // -------------------------------------------------
  triggerFall(): void {
    const action = this.ps.triggerFall();
    if (action === "none") return;
    this.setScale(1, 1);
    this.playAnim("fall");
    this.emit("fell");
  }

  triggerGoal(): void {
    const action = this.ps.triggerGoal();
    if (action === "none") return;
    this.setScale(1, 1);
    this.playAnim("goal");
  }

  triggerEnemyCaught(): void {
    const action = this.ps.triggerEnemyCaught();
    if (action === "none") return;
    // reset_scale_and_stop: falling=false 経由（現在フレームで固定）
    this.setScale(1, 1);
    this.anims.stop();
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
    // 同一キーでも停止中であれば再起動する
    if (this.anims.currentAnim?.key !== key || !this.anims.isPlaying) {
      this.play(key);
    }
  }

  // -------------------------------------------------
  // 毎フレーム更新
  // -------------------------------------------------
  update(): void {
    if (this.ps.gameOver) return;

    // キーボード入力（スペースキー）
    const spaceJustDown = Phaser.Input.Keyboard.JustDown(this.keySpace);
    const spaceJustUp = Phaser.Input.Keyboard.JustUp(this.keySpace);

    if (spaceJustDown) this.startCharge();
    if (spaceJustUp) this.releaseJump();

    // チャージ量に連動して Y 方向に縮小・X 方向に拡大（Y: 下端起点、X: 中央起点）
    const chargeAmount = this.getChargeAmount();
    if (chargeAmount > 0) {
      this.setScale(calcChargeScaleX(chargeAmount), calcChargeScaleY(chargeAmount));
    } else {
      this.setScale(1, 1);
    }
  }
}
