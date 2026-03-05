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

/** ゲームプレイゾーン内の画面幅（ロジック用） */
const GAME_W = CANVAS_W;
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
  | "game_over";

export class GameScene extends Phaser.Scene {
  private difficulty!: DifficultyEntry;

  private scrollManager!: ScrollManager;
  private player!: Player;
  private enemy!: Enemy;
  private hud!: HUD;
  private collision!: CollisionManager;

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

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { difficulty: DifficultyEntry }): void {
    this.difficulty = data.difficulty;
    this.scrolledX = 0;
    this.collectedCount = 0;
    this.state = "playing";
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
    this.player.setupInput(this.input.keyboard!, this.input);

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

    // --- CollisionManager ---
    this.collision = new CollisionManager(this, this.player, this.enemy);

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

    // shutdown 時にリスナーを明示的にクリーンアップ
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off("stoneHit", this.onStoneHit, this);
      this.events.off("witchHit", this.onWitchHit, this);
      this.events.off("receiptCollected", this.onReceiptCollected, this);
      this.events.off("enemyReached", this.onEnemyReached, this);
    });
  }

  update(_time: number, delta: number): void {
    if (
      this.state === "stone_fall" ||
      this.state === "game_over" ||
      this.state === "cleared"
    ) {
      this.enemy.update(delta);
      this.collision.checkEnemyReached();
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
      for (const s of this.stones) s.updateScroll(this.scrolledX);
      for (const w of this.witches) w.updateScroll(this.scrolledX, speed, delta);
      for (const r of this.receipts) r.updateScroll(this.scrolledX, speed, delta);
      this.taxOffice.img.x = this.taxOffice.worldX - this.scrolledX;
      this.collision.checkEnemyReached();
      return;
    }

    // スクロール
    const speed = this.scrollManager.getSpeed();
    const dx = (speed * delta) / 1000;
    this.scrolledX += dx;
    this.scrollManager.update(delta);

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

  private onReceiptCollected(): void {
    this.collectedCount++;
    this.hud.setCollectedCount(this.collectedCount);
  }

  private onEnemyReached(): void {
    if (this.state === "game_over" || this.state === "cleared") return;
    this.state = "game_over";
    this.scrollManager.stop();
    this.enemy.stopChasing();
    this.player.triggerEnemyCaught();
    this.time.delayedCall(2000, () => {
      this.scene.start("ResultScene", {
        result: "gameover",
        collected: this.collectedCount,
        total: this.totalReceipts,
        difficultyId: this.difficulty.id,
      });
    });
  }

  private onScrollOverrun(): void {
    if (this.state === "game_over" || this.state === "cleared") return;
    this.state = "game_over";
    this.scrollManager.stop();
    this.enemy.stopChasing();
    this.time.delayedCall(2000, () => {
      this.scene.start("ResultScene", {
        result: "gameover",
        collected: this.collectedCount,
        total: this.totalReceipts,
        difficultyId: this.difficulty.id,
      });
    });
  }

  private onGoalReached(): void {
    if (this.state === "game_over" || this.state === "cleared") return;
    this.state = "cleared";
    this.scrollManager.stop();
    this.player.triggerGoal();
    this.showClearEffect();

    this.time.delayedCall(3000, () => {
      this.scene.start("ResultScene", {
        result: "clear",
        collected: this.collectedCount,
        total: this.totalReceipts,
        difficultyId: this.difficulty.id,
      });
    });
  }

  // -------------------------------------------------
  // クリア演出
  // -------------------------------------------------
  private showClearEffect(): void {
    const { width } = this.scale;

    // 「確定！！」テキスト — ゲームプレイゾーン中央に表示
    const gameZoneCenterY = GAME_ZONE_Y + GAME_ZONE_HEIGHT / 2;
    this.add
      .text(width / 2, gameZoneCenterY - 40, "確定！！", {
        fontSize: "80px",
        color: "#ffee00",
        fontFamily: "sans-serif",
        stroke: "#cc6600",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(30);

    // 紙吹雪パーティクル — ゲームプレイゾーン内で降らせる
    const colors = [0xff0000, 0x00ff00, 0x0088ff, 0xffee00, 0xff88ff];
    const particles = this.add.particles(0, 0, "__DEFAULT", {
      x: { min: 0, max: width },
      y: GAME_ZONE_Y - 20,
      speedY: { min: 100, max: 300 },
      speedX: { min: -60, max: 60 },
      lifespan: 3000,
      quantity: 4,
      scale: { start: 0.3, end: 0.1 },
      tint: colors,
      frequency: 50,
    });
    particles.setDepth(29);

    this.time.delayedCall(3000, () => particles.destroy());
  }
}
