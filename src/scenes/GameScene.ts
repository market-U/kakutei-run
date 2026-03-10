import Phaser from "phaser";
import type { DifficultyEntry } from "../config/difficultyConfig";
import { gameConfig } from "../config/gameConfig";
import {
  CANVAS_W,
  GAME_ZONE_Y,
  GAME_ZONE_HEIGHT,
} from "../config/canvasConfig";
import {
  ScrollManager,
  GROUND_Y,
  GROUND_HEIGHT,
} from "../systems/ScrollManager";
import { MapGenerator } from "../systems/MapGenerator";
import { CollisionManager } from "../systems/CollisionManager";
import { Player } from "../objects/Player";
import { Stone } from "../objects/Stone";
import { Witch } from "../objects/Witch";
import { Receipt } from "../objects/Receipt";
import { Enemy } from "../objects/Enemy";
import { HUD } from "../ui/HUD";
import { AssetKeys } from "../assets/AssetKeys";
import { CommentManager, CROSSING_DURATION } from "../systems/CommentManager";
import { EffectManager } from "../systems/EffectManager";

/** ゲームプレイゾーン内の画面幅（ロジック用） */
const GAME_W = CANVAS_W;

/** Enemy 到達時にランダム表示するメッセージ一覧 */
const ENEMY_REACHED_TEXTS = ["申告は正確に", "3月16日です", "追徴課税です", "税務調査入ります", "もっと早く準備を始めましょう"];
/** ゲームプレイゾーンの高さ（ロジック用） */
const GAME_H = GAME_ZONE_HEIGHT;
/** プレーヤーの固定 X 位置 */
const PLAYER_SCREEN_X = GAME_W / 2;
/** 敵の初期距離 (px) — プレーヤーX(GAME_W/2)から左端を約50px見せる位置 */
const INITIAL_ENEMY_DISTANCE = GAME_W / 2 - 20;
/** 地面の画面Y座標（ゲームゾーンオフセット加算済み） */
const SCREEN_GROUND_Y = GROUND_Y + GAME_ZONE_Y;

/** 税務署（ゴール）の画像 */
interface TaxOfficeObj {
  worldX: number;
  img: Phaser.GameObjects.Image;
}

type GameState =
  | "playing"
  | "back_pain_slow"
  | "stone_fall_coasting"
  | "stone_fall"
  | "cleared"
  | "game_over"
  | "paused";

export class GameScene extends Phaser.Scene {
  private difficulty!: DifficultyEntry;

  private scrollManager!: ScrollManager;
  private player!: Player;
  private enemy!: Enemy;
  private hud!: HUD;
  private collision!: CollisionManager;
  private commentManager!: CommentManager;
  private effectManager!: EffectManager;

  private stones: Stone[] = [];
  private witches: Witch[] = [];
  private receipts: Receipt[] = [];
  private taxOffice!: TaxOfficeObj;

  private scrolledX = 0;
  private collectedCount = 0;
  private totalReceipts = 0;

  private state: GameState = "playing";
  private baseScrollSpeed = 0;

  // 腰痛スロー時の速度
  private slowedScrollSpeed = 0;

  // 腰痛スロータイマー（石ころ被弾時にキャンセルするために保持）
  private backPainTimer: Phaser.Time.TimerEvent | null = null;

  // ゲーム終了後の各種 delayedCall（SHUTDOWN 時にキャンセルするために保持）
  private resultDispatchTimer: Phaser.Time.TimerEvent | null = null;
  private commentStopSpawnTimer: Phaser.Time.TimerEvent | null = null;
  private commentDisableTimer: Phaser.Time.TimerEvent | null = null;
  private particlesCleanupTimer: Phaser.Time.TimerEvent | null = null;

  // ポーズ前の状態（再開時に復元）
  private stateBeforePause: GameState = "playing";

  // window イベントのクリーンアップ用参照
  private onOrientationChanged!: () => void;
  private onPauseBtnClick!: () => void;
  private onPauseResumeBtnClick!: () => void;
  private onPauseReturnTitleBtnClick!: () => void;
  private onCommentToggleBtnClick!: () => void;
  private onDocumentPointerDown!: (e: PointerEvent) => void;
  private onDocumentPointerUp!: () => void;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { difficulty: DifficultyEntry }): void {
    this.difficulty = data.difficulty;
    this.scrolledX = 0;
    this.collectedCount = 0;
    this.state = "playing";
    this.backPainTimer = null;
    this.resultDispatchTimer = null;
    this.commentStopSpawnTimer = null;
    this.commentDisableTimer = null;
    this.particlesCleanupTimer = null;
  }

  create(): void {
    this.baseScrollSpeed = this.difficulty.scrollSpeed;
    this.slowedScrollSpeed =
      this.baseScrollSpeed * (1 - gameConfig.witchSpeedReduction);

    // --- ScrollManager ---
    this.scrollManager = new ScrollManager(this, this.baseScrollSpeed);

    // --- 地面コライダー（Phaser physics static body） ---
    const groundImg = this.add
      .image(0, SCREEN_GROUND_Y, AssetKeys.GROUND)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(2)
      .setVisible(false); // ScrollManager の tileSprite が見えているので非表示
    void groundImg;

    // プレーヤーの physics ground line（Y = SCREEN_GROUND_Y）
    const groundLine = this.physics.add
      .staticImage(GAME_W / 2, SCREEN_GROUND_Y + GROUND_HEIGHT / 2, "__DEFAULT")
      .setDisplaySize(GAME_W, GROUND_HEIGHT)
      .setAlpha(0);
    groundLine.refreshBody();

    // --- プレーヤー ---
    this.player = new Player(
      this,
      PLAYER_SCREEN_X,
      SCREEN_GROUND_Y,
      this.difficulty,
    );
    this.player.setInitialEnemyDistance(INITIAL_ENEMY_DISTANCE);
    this.player.setupInput(this.input.keyboard!);

    // プレーヤーと地面の Arcade collider (着地判定)
    this.physics.add.collider(this.player, groundLine, () => {
      if (!this.player.isOnGround()) {
        this.player.onLanded();
      }
    });

    // --- マップ生成 ---
    const mapGen = new MapGenerator(this.difficulty, GAME_H, GAME_W);
    const placed = mapGen.generate();

    this.stones = [];
    this.witches = [];
    this.receipts = [];

    for (const obj of placed) {
      if (obj.type === "stone") {
        this.stones.push(new Stone(this, obj.worldX, SCREEN_GROUND_Y));
      } else if (obj.type === "witch") {
        this.witches.push(
          new Witch(this, obj.worldX, obj.worldY + GAME_ZONE_Y),
        );
      } else {
        this.receipts.push(
          new Receipt(this, obj.worldX, obj.worldY + GAME_ZONE_Y),
        );
      }
    }

    this.totalReceipts = this.receipts.length;

    // --- ゴール（税務署） ---
    const TAX_OFFICE_OFFSET_Y = 0; // 地面からのオフセット
    const goalWorldX = this.difficulty.stageLength + 200;
    const goalImg = this.add
      .image(goalWorldX, SCREEN_GROUND_Y - TAX_OFFICE_OFFSET_Y, AssetKeys.TAX_OFFICE)
      .setOrigin(0.5, 1)
      .setDepth(5);
    this.taxOffice = { worldX: goalWorldX, img: goalImg };

    // --- 敵 ---
    this.enemy = new Enemy(this, INITIAL_ENEMY_DISTANCE);
    // Y 座標: 地面に揃える（ゲームゾーンオフセット加算済み）
    const enemyBody = this.enemy as Phaser.GameObjects.Sprite;
    enemyBody.y = SCREEN_GROUND_Y;

    // --- HUD ---
    this.hud = new HUD(this, this.totalReceipts);
    this.hud.setDifficulty(this.difficulty.displayName);

    // --- CollisionManager ---
    this.collision = new CollisionManager(this, this.player, this.enemy);

    // --- EffectManager ---
    this.effectManager = new EffectManager(this);

    // --- CommentManager ---
    this.commentManager = new CommentManager(this);
    this.commentManager.startGame(this.difficulty.id);

    // --- イベントハンドラ（再起動時の累積を防ぐため事前に off する） ---
    this.events.off("stoneHit", this.onStoneHit, this);
    this.events.off("witchHit", this.onWitchHit, this);
    this.events.off("receiptCollected", this.onReceiptCollected, this);
    this.events.off("enemyReached", this.onEnemyReached, this);

    this.events.on("stoneHit", this.onStoneHit, this);
    this.events.on("witchHit", this.onWitchHit, this);
    this.events.on("receiptCollected", this.onReceiptCollected, this);
    this.events.on("enemyReached", this.onEnemyReached, this);

    this.player.on("backPainActivated", (data: { slowDuration: number }) => {
      this.onBackPainStart(data.slowDuration);
    });

    // --- 全画面タッチジャンプ（document レベルで受け取る） ---
    this.onDocumentPointerDown = (e: PointerEvent) => {
      // ボタン・ポーズオーバーレイへのタップは無視
      if ((e.target as Element).closest("button, #pause-overlay")) return;
      this.player.startCharge();
    };
    this.onDocumentPointerUp = () => {
      this.player.releaseJump();
    };
    document.addEventListener("pointerdown", this.onDocumentPointerDown);
    document.addEventListener("pointerup", this.onDocumentPointerUp);

    // --- ポーズ・コメントトグル関連の window イベントリスナー ---
    this.onPauseBtnClick = () => this.pause();
    this.onOrientationChanged = () => this.pause();
    this.onPauseResumeBtnClick = () => this.resume();
    this.onPauseReturnTitleBtnClick = () => {
      document.getElementById("pause-overlay")!.classList.remove("visible");
      window.dispatchEvent(new CustomEvent("kakutei:returnToTitle"));
    };
    this.onCommentToggleBtnClick = () => {
      this.commentManager.setEnabled(!this.commentManager.isEnabled);
      this.hud.setCommentEnabled(this.commentManager.isEnabled);
    };

    document
      .getElementById("pause-btn")!
      .addEventListener("click", this.onPauseBtnClick);
    window.addEventListener("kakutei:orientationChanged", this.onOrientationChanged);
    document
      .getElementById("pause-resume-btn")!
      .addEventListener("click", this.onPauseResumeBtnClick);
    document
      .getElementById("pause-return-title-btn")!
      .addEventListener("click", this.onPauseReturnTitleBtnClick);
    document
      .getElementById("comment-toggle-btn")!
      .addEventListener("click", this.onCommentToggleBtnClick);

    // shutdown 時にリスナー・タイマー・オブジェクトをクリーンアップ
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);
  }

  private onShutdown(): void {
    // シーンイベントのリスナー解除
    this.events.off("stoneHit", this.onStoneHit, this);
    this.events.off("witchHit", this.onWitchHit, this);
    this.events.off("receiptCollected", this.onReceiptCollected, this);
    this.events.off("enemyReached", this.onEnemyReached, this);
    // player のカスタムイベントリスナー解除
    this.player?.off("backPainActivated");
    // DOM・window イベントリスナー解除
    document.getElementById("pause-btn")?.removeEventListener("click", this.onPauseBtnClick);
    window.removeEventListener("kakutei:orientationChanged", this.onOrientationChanged);
    document.getElementById("pause-resume-btn")?.removeEventListener("click", this.onPauseResumeBtnClick);
    document.getElementById("pause-return-title-btn")?.removeEventListener("click", this.onPauseReturnTitleBtnClick);
    document.getElementById("comment-toggle-btn")?.removeEventListener("click", this.onCommentToggleBtnClick);
    document.removeEventListener("pointerdown", this.onDocumentPointerDown);
    document.removeEventListener("pointerup", this.onDocumentPointerUp);
    // delayedCall タイマーをキャンセル
    this.backPainTimer?.remove(false);
    this.resultDispatchTimer?.remove(false);
    this.commentStopSpawnTimer?.remove(false);
    this.commentDisableTimer?.remove(false);
    this.particlesCleanupTimer?.remove(false);
    // コメント・エフェクトを一括破棄
    this.commentManager?.shutdown();
    this.effectManager?.destroy();
  }

  update(_time: number, delta: number): void {
    if (this.state === "paused") return;

    if (
      this.state === "stone_fall" ||
      this.state === "game_over" ||
      this.state === "cleared"
    ) {
      this.enemy.update(delta);
      this.collision.checkEnemyReached();
      this.commentManager.update(delta);
      return;
    }

    // セーフネット: 状態遷移の考慮漏れ等でスクロールが異常に継続した場合に強制終了する
    if (this.scrolledX > this.difficulty.stageLength + 500) {
      this.onScrollOverrun();
      return;
    }

    // 転倒アニメーション再生中: スクロール継続、敵は待機
    if (this.state === "stone_fall_coasting") {
      const speed = this.scrollManager.getSpeed();
      const dx = (speed * delta) / 1000;
      this.scrolledX += dx;
      this.scrollManager.update(delta);
      this.effectManager.update(dx);
      for (const s of this.stones) s.updateScroll(this.scrolledX);
      for (const w of this.witches) w.updateScroll(this.scrolledX, speed, delta);
      for (const r of this.receipts) r.updateScroll(this.scrolledX, speed, delta);
      this.taxOffice.img.x = this.taxOffice.worldX - this.scrolledX;
      this.collision.checkEnemyReached();
      this.commentManager.update(delta);
      return;
    }

    // スクロール
    const speed = this.scrollManager.getSpeed();
    const dx = (speed * delta) / 1000;
    this.scrolledX += dx;
    this.scrollManager.update(delta);
    this.effectManager.update(dx);

    // プレーヤー
    this.player.update();

    // ワールドオブジェクト更新
    for (const s of this.stones) s.updateScroll(this.scrolledX);
    for (const w of this.witches) w.updateScroll(this.scrolledX, speed, delta);
    for (const r of this.receipts) r.updateScroll(this.scrolledX, speed, delta);

    // ゴール更新
    this.taxOffice.img.x = this.taxOffice.worldX - this.scrolledX;

    // 敵更新
    this.enemy.update(delta);

    // 衝突判定
    this.collision.checkStones(this.stones);
    this.collision.checkWitches(this.witches);
    this.collision.checkReceipts(this.receipts);
    this.collision.checkEnemyReached();

    // コメント更新
    this.commentManager.update(delta);

    // HUD 更新
    this.hud.setDistance(Math.floor(this.scrolledX / 10)); // px → m 変換
    this.hud.setCollectedCount(this.collectedCount);

    // ゴール到達チェック
    if (
      this.taxOffice.img.x < PLAYER_SCREEN_X + 80 &&
      (this.state === "playing" || this.state === "back_pain_slow")
    ) {
      this.onGoalReached();
    }
  }

  // -------------------------------------------------
  // イベントハンドラ
  // -------------------------------------------------
  private onStoneHit(): void {
    if (this.state !== "playing" && this.state !== "back_pain_slow") return;
    this.commentManager.triggerEvent("stumble", 6);
    // 腰痛スロータイマーが残っていればキャンセルする
    if (this.backPainTimer) {
      this.backPainTimer.remove(false);
      this.backPainTimer = null;
    }
    this.state = "stone_fall_coasting";
    this.player.setJumpDisabled(true);

    // fall アニメーション完了後にスクロール停止・敵追跡開始
    this.player.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "player_fall",
      () => {
        this.scrollManager.stop();
        this.enemy.startChasing();
        this.state = "stone_fall";
      },
    );
  }

  private onWitchHit(_hitCount: number): void {
    // ゲームオーバーは CollisionManager.checkEnemyReached() による
    // Enemy・Player の矩形接触判定のみで発火させる。
    // 魔女被弾回数（hitCount）を根拠に直接ゲームオーバーにしてはならない。
  }

  private onBackPainStart(slowDuration: number): void {
    if (this.state !== "playing" && this.state !== "back_pain_slow") return;
    this.commentManager.triggerEvent("backPain", 4);
    this.state = "back_pain_slow";
    this.scrollManager.setSpeed(this.slowedScrollSpeed);
    this.enemy.applyWitchHit(slowDuration);

    // タイマーを保持して石ころ被弾時にキャンセルできるようにする
    this.backPainTimer = this.time.delayedCall(slowDuration * 1000, () => {
      this.backPainTimer = null;
      if (this.state === "back_pain_slow") {
        this.state = "playing";
        this.scrollManager.setSpeed(this.baseScrollSpeed);
      }
    });
  }

  private onReceiptCollected(data: { x: number; y: number }): void {
    this.collectedCount++;
    this.hud.setCollectedCount(this.collectedCount);
    this.effectManager.spawnFloatingText({
      x: data.x,
      y: data.y - 48,
      text: "+1",
      sizePx: 32,
      color: "#ee4697",
      followScroll: true,
    });
  }

  private onEnemyReached(): void {
    if (this.state === "game_over" || this.state === "cleared") return;
    this.state = "game_over";
    this.scrollManager.stop();
    this.enemy.stopChasing();
    this.commentManager.startLoopBurst("stumble", 6);
    this.player.triggerEnemyCaught();
    this.effectManager.spawnText({
      x: PLAYER_SCREEN_X,
      y: SCREEN_GROUND_Y - 120,
      text: Phaser.Math.RND.pick(ENEMY_REACHED_TEXTS),
      sizePx: 28,
      color: "#000",
      followScroll: false,
    });
    this.resultDispatchTimer = this.time.delayedCall(2000, () => {
      this.hud.destroy();
      window.dispatchEvent(
        new CustomEvent("kakutei:gameResult", {
          detail: {
            result: "gameover",
            collected: this.collectedCount,
            total: this.totalReceipts,
            difficultyId: this.difficulty.id,
            shareComment: this.commentManager.getShareComment(),
            distance: Math.floor(this.scrolledX / 10),
          },
        }),
      );
    });
    // リザルト画面表示から約5秒後に新規投入を停止し、さらに CROSSING_DURATION(3500ms) 後に表示も停止する
    this.commentStopSpawnTimer = this.time.delayedCall(7000, () => { this.commentManager.stopSpawning(); });
    this.commentDisableTimer = this.time.delayedCall(7000 + CROSSING_DURATION, () => { this.commentManager.setEnabled(false); });
  }

  private onScrollOverrun(): void {
    if (this.state === "game_over" || this.state === "cleared") return;
    this.state = "game_over";
    this.scrollManager.stop();
    this.enemy.stopChasing();
    this.commentManager.startLoopBurst("stumble", 6);
    this.resultDispatchTimer = this.time.delayedCall(2000, () => {
      this.hud.destroy();
      window.dispatchEvent(
        new CustomEvent("kakutei:gameResult", {
          detail: {
            result: "gameover",
            collected: this.collectedCount,
            total: this.totalReceipts,
            difficultyId: this.difficulty.id,
            shareComment: this.commentManager.getShareComment(),
            distance: Math.floor(this.scrolledX / 10),
          },
        }),
      );
    });
    // リザルト画面表示から約5秒後に新規投入を停止し、さらに CROSSING_DURATION(3500ms) 後に表示も停止する
    this.commentStopSpawnTimer = this.time.delayedCall(7000, () => { this.commentManager.stopSpawning(); });
    this.commentDisableTimer = this.time.delayedCall(7000 + CROSSING_DURATION, () => { this.commentManager.setEnabled(false); });
  }

  private onGoalReached(): void {
    if (this.state === "game_over" || this.state === "cleared") return;
    this.state = "cleared";
    this.scrollManager.stop();
    this.commentManager.startLoopBurst("goal", 9);
    this.player.triggerGoal();
    this.showClearEffect();

    this.resultDispatchTimer = this.time.delayedCall(3000, () => {
      this.hud.destroy();
      window.dispatchEvent(
        new CustomEvent("kakutei:gameResult", {
          detail: {
            result: "clear",
            collected: this.collectedCount,
            total: this.totalReceipts,
            difficultyId: this.difficulty.id,
            shareComment: this.commentManager.getShareComment(),
            distance: Math.floor(this.scrolledX / 10),
          },
        }),
      );
    });
    // リザルト画面表示から約5秒後に新規投入を停止し、さらに CROSSING_DURATION(3500ms) 後に表示も停止する
    this.commentStopSpawnTimer = this.time.delayedCall(8000, () => { this.commentManager.stopSpawning(); });
    this.commentDisableTimer = this.time.delayedCall(8000 + CROSSING_DURATION, () => { this.commentManager.setEnabled(false); });
  }

  // -------------------------------------------------
  // ポーズ / 再開
  // -------------------------------------------------
  private pause(): void {
    if (
      this.state === "paused" ||
      this.state === "game_over" ||
      this.state === "cleared"
    )
      return;
    this.stateBeforePause = this.state;
    this.state = "paused";
    this.scrollManager.stop();
    document.getElementById("pause-overlay")!.classList.add("visible");
  }

  private resume(): void {
    if (this.state !== "paused") return;
    document.getElementById("pause-overlay")!.classList.remove("visible");
    this.state = this.stateBeforePause;
    this.scrollManager.resume();
    if (
      this.state === "playing" ||
      this.state === "back_pain_slow" ||
      this.state === "stone_fall_coasting"
    ) {
      const speed =
        this.state === "back_pain_slow"
          ? this.slowedScrollSpeed
          : this.baseScrollSpeed;
      this.scrollManager.setSpeed(speed);
    }
  }

  // -------------------------------------------------
  // クリア演出
  // -------------------------------------------------
  private showClearEffect(): void {
    const { width } = this.scale;

    // 「確定！！」テキスト — ゲームプレイゾーン中央に表示
    const textPosition = {
      x: this.player.x,
      y: this.player.y - 200,
    };
    const clearText = this.add
      .text(textPosition.x, textPosition.y , "確定!", {
        fontSize: "120px",
        fontStyle: "bold",
        color: "#f5e618",
        fontFamily: "LINE Seed JP, sans-serif",
        stroke: "#b0252c",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setScale(0)
      .setAngle(-10);

    this.tweens.chain({
      tweens: [
        {
          targets: clearText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 800
        },
        {
          targets: clearText,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 400,
          ease: "Sine.InOut",
          easeParams: [1.2, 0.5],
          yoyo: true,
          loop: -1
        }
      ],
      onComplete: () => {
        clearText.destroy();
      }
    })

    // 紙吹雪パーティクル — ゲームプレイゾーン内で降らせる
    if (!this.textures.exists("confetti")) {
      const g = this.make.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 10, 16);
      g.generateTexture("confetti", 10, 16);
      g.destroy();
    }
    // colorsStr = ["#f87a7a", "#c2ff90", "#78d7ff", "#eae451", "#f5ac52"];
    const colors = [0xf87a7a, 0xc2ff90, 0x78d7ff, 0xeae451, 0xf5ac52];
    const particles = this.add.particles(0, 0, "confetti", {
      x: { min: 0, max: width },
      y: GAME_ZONE_Y - 20,
      speedY: { min: 100, max: 300 },
      speedX: { min: -60, max: 60 },
      lifespan: 3000,
      quantity: 4,
      scale: { start: 1, end: 0.3 },
      rotate: { min: -180, max: 180 },
      tint: colors,
      frequency: 50,
    });
    particles.setDepth(29);

    this.particlesCleanupTimer = this.time.delayedCall(3000, () => particles.destroy());
  }
}
