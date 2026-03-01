import Phaser from "phaser";
import { AssetKeys, FrameSize, FrameCount } from "../assets/AssetKeys";
import { CANVAS_W, CANVAS_H } from "../config/canvasConfig";

/** アセット読み込みとローディング進捗表示を担当するシーン */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    this.createProgressBar();
    this.loadSpritesheets();
    this.loadStaticImages();
  }

  create(): void {
    this.scene.start("TitleScene");
  }

  // -------------------------------------------------
  // プログレスバー
  // -------------------------------------------------
  private createProgressBar(): void {
    const barW = 500;
    const barH = 24;
    const barX = (CANVAS_W - barW) / 2;
    const barY = CANVAS_H / 2;

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222);
    bg.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

    // プログレスバー本体
    const bar = this.add.graphics();

    this.add
      .text(CANVAS_W / 2, barY - 40, "Loading...", {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "sans-serif",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      bar.clear();
      bar.fillStyle(0x4aa8ff);
      bar.fillRect(barX, barY, barW * value, barH);
    });

    this.load.on("complete", () => {
      bar.destroy();
      bg.destroy();
    });
  }

  // -------------------------------------------------
  // アセット読み込み
  // -------------------------------------------------
  private loadSpritesheets(): void {
    this.load.spritesheet(
      AssetKeys.PLAYER_RUN,
      "/assets/sprites/player_run.png",
      {
        frameWidth: FrameSize.PLAYER.width,
        frameHeight: FrameSize.PLAYER.height,
        endFrame: FrameCount.PLAYER_RUN - 1,
      },
    );
    this.load.spritesheet(
      AssetKeys.PLAYER_FALL,
      "/assets/sprites/player_fall.png",
      {
        frameWidth: FrameSize.PLAYER.width,
        frameHeight: FrameSize.PLAYER.height,
        endFrame: FrameCount.PLAYER_FALL - 1,
      },
    );
    this.load.spritesheet(
      AssetKeys.PLAYER_GOAL,
      "/assets/sprites/player_goal.png",
      {
        frameWidth: FrameSize.PLAYER.width,
        frameHeight: FrameSize.PLAYER.height,
        endFrame: FrameCount.PLAYER_GOAL - 1,
      },
    );
    this.load.spritesheet(
      AssetKeys.PLAYER_BACK_PAIN,
      "/assets/sprites/player_back_pain.png",
      {
        frameWidth: FrameSize.PLAYER.width,
        frameHeight: FrameSize.PLAYER.height,
        endFrame: FrameCount.PLAYER_BACK_PAIN - 1,
      },
    );
    this.load.spritesheet(
      AssetKeys.ENEMY_RUN,
      "/assets/sprites/enemy_run.png",
      {
        frameWidth: FrameSize.ENEMY.width,
        frameHeight: FrameSize.ENEMY.height,
        endFrame: FrameCount.ENEMY_RUN - 1,
      },
    );
    this.load.spritesheet(
      AssetKeys.WITCH_FLOAT,
      "/assets/sprites/witch_float.png",
      {
        frameWidth: FrameSize.WITCH.width,
        frameHeight: FrameSize.WITCH.height,
        endFrame: FrameCount.WITCH_FLOAT - 1,
      },
    );
  }

  private loadStaticImages(): void {
    this.load.image(AssetKeys.TAX_OFFICE, "/assets/sprites/tax_office.png");
    this.load.image(AssetKeys.RECEIPT_1, "/assets/sprites/receipt_1.png");
    this.load.image(AssetKeys.RECEIPT_2, "/assets/sprites/receipt_2.png");
    this.load.image(AssetKeys.RECEIPT_3, "/assets/sprites/receipt_3.png");
    this.load.image(AssetKeys.STONE_1, "/assets/sprites/stone_1.png");
    this.load.image(AssetKeys.STONE_2, "/assets/sprites/stone_2.png");
    this.load.image(AssetKeys.STONE_3, "/assets/sprites/stone_3.png");
    this.load.image(AssetKeys.BG_FAR, "/assets/sprites/bg_far.png");
    this.load.image(AssetKeys.BG_NEAR, "/assets/sprites/bg_near.png");
    this.load.image(AssetKeys.GROUND, "/assets/sprites/ground.png");
  }
}
