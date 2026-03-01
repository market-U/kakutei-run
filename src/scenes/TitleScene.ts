import Phaser from "phaser";
import { difficulties, getDifficultyById } from "../config/difficultyConfig";
import { UI_BOTTOM_Y } from "../config/canvasConfig";

/** 難易度選択とゲーム開始を担当するタイトルシーン */
export class TitleScene extends Phaser.Scene {
  private selectedDifficultyId = "normal";
  private difficultyButtons: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: "TitleScene" });
  }

  create(): void {
    const { width } = this.scale;

    this.selectedDifficultyId = "normal";

    // --- タイトル（UI上部ゾーン: y=0〜360） ---
    this.add
      .text(width / 2, 120, "確定申告ラン", {
        fontSize: "72px",
        color: "#ffffff",
        fontFamily: "sans-serif",
        stroke: "#333333",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 240, "難易度を選択してください", {
        fontSize: "32px",
        color: "#dddddd",
        fontFamily: "sans-serif",
      })
      .setOrigin(0.5);

    // --- 難易度選択ボタン（UI下部ゾーン: y=900〜1440, 縦並び） ---
    const btnStartY = UI_BOTTOM_Y + 60;
    const btnSpacing = 100;

    this.difficultyButtons = [];
    difficulties.forEach((diff, idx) => {
      const btn = this.add
        .text(width / 2, btnStartY + idx * btnSpacing, diff.displayName, {
          fontSize: "40px",
          fontFamily: "sans-serif",
          padding: { x: 40, y: 14 },
          backgroundColor: "#444444",
          color: "#aaaaaa",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () => {
        this.selectedDifficultyId = diff.id;
        this.updateButtonHighlights();
      });

      btn.on("pointerover", () => {
        if (this.selectedDifficultyId !== diff.id) {
          btn.setStyle({ backgroundColor: "#555555" });
        }
      });

      btn.on("pointerout", () => {
        if (this.selectedDifficultyId !== diff.id) {
          btn.setStyle({ backgroundColor: "#444444", color: "#aaaaaa" });
        }
      });

      this.difficultyButtons.push(btn);
    });

    this.updateButtonHighlights();

    // --- スタートボタン（難易度ボタンの下） ---
    const startBtnY = btnStartY + difficulties.length * btnSpacing + 40;
    const startBtn = this.add
      .text(width / 2, startBtnY, "スタート", {
        fontSize: "44px",
        fontFamily: "sans-serif",
        padding: { x: 60, y: 18 },
        backgroundColor: "#e05020",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    startBtn.on("pointerover", () => {
      startBtn.setStyle({ backgroundColor: "#ff6030" });
    });

    startBtn.on("pointerout", () => {
      startBtn.setStyle({ backgroundColor: "#e05020" });
    });

    startBtn.on("pointerdown", () => {
      const difficulty = getDifficultyById(this.selectedDifficultyId);
      this.scene.start("GameScene", { difficulty });
    });

    // --- フッター説明 ---
    this.add
      .text(
        width / 2,
        1400,
        "スペース or タップ: ジャンプ（長押しでチャージ）",
        {
          fontSize: "22px",
          color: "#aaaaaa",
          fontFamily: "sans-serif",
        },
      )
      .setOrigin(0.5);
  }

  private updateButtonHighlights(): void {
    difficulties.forEach((diff, idx) => {
      const btn = this.difficultyButtons[idx];
      if (diff.id === this.selectedDifficultyId) {
        btn.setStyle({ backgroundColor: "#e09020", color: "#ffffff" });
      } else {
        btn.setStyle({ backgroundColor: "#444444", color: "#aaaaaa" });
      }
    });
  }
}
