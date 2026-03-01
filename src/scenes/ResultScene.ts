import Phaser from "phaser";
import { getDifficultyById, difficulties } from "../config/difficultyConfig";
import { CANVAS_W, UI_BOTTOM_Y } from "../config/canvasConfig";

interface ResultData {
  result: "clear" | "gameover";
  collected: number;
  total: number;
  difficultyId: string;
}

/** クリア・ゲームオーバー結果を表示するシーン */
export class ResultScene extends Phaser.Scene {
  private data_!: ResultData;

  constructor() {
    super({ key: "ResultScene" });
  }

  init(data: ResultData): void {
    this.data_ = data;
  }

  create(): void {
    const cx = CANVAS_W / 2;
    const { result, collected, total, difficultyId } = this.data_;

    const score = total > 0 ? Math.floor((collected / total) * 100) : 0;

    // ========== UI 上部ゾーン (y=0〜360) ==========

    // --- 結果タイトル ---
    const isClear = result === "clear";
    this.add
      .text(cx, 120, isClear ? "クリア！" : "ゲームオーバー", {
        fontSize: "72px",
        color: isClear ? "#ffee00" : "#ff4444",
        fontFamily: "sans-serif",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // --- スコア（上部ゾーン下段） ---
    this.add
      .text(cx, 240, `レシート回収率: ${score}%`, {
        fontSize: "44px",
        color: "#ffffff",
        fontFamily: "sans-serif",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 310, `${collected} / ${total} 枚`, {
        fontSize: "30px",
        color: "#bbbbbb",
        fontFamily: "sans-serif",
      })
      .setOrigin(0.5);

    // ========== UI 下部ゾーン (y=900〜1440) ==========

    // --- SNSシェアボタン ---
    const shareBtn = this.add
      .text(cx, UI_BOTTOM_Y + 60, "📱 シェア", {
        fontSize: "36px",
        fontFamily: "sans-serif",
        padding: { x: 32, y: 14 },
        backgroundColor: "#1da1f2",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    shareBtn.on("pointerdown", () => {
      void this.doShare(score, difficultyId);
    });

    shareBtn.on("pointerover", () =>
      shareBtn.setStyle({ backgroundColor: "#1a8cd8" }),
    );
    shareBtn.on("pointerout", () =>
      shareBtn.setStyle({ backgroundColor: "#1da1f2" }),
    );

    // --- 難易度選択付きリトライ ---
    this.add
      .text(cx, UI_BOTTOM_Y + 180, "難易度を選んでリトライ", {
        fontSize: "28px",
        color: "#cccccc",
        fontFamily: "sans-serif",
      })
      .setOrigin(0.5);

    const btnSpacing = 100;
    const startY = UI_BOTTOM_Y + 270;

    difficulties.forEach((diff, idx) => {
      const isCurrent = diff.id === difficultyId;
      const btn = this.add
        .text(cx, startY + idx * btnSpacing, diff.displayName, {
          fontSize: "40px",
          fontFamily: "sans-serif",
          padding: { x: 40, y: 12 },
          backgroundColor: isCurrent ? "#e09020" : "#444444",
          color: isCurrent ? "#ffffff" : "#aaaaaa",
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () => {
        const difficulty = getDifficultyById(diff.id);
        this.scene.start("GameScene", { difficulty });
      });
      btn.on("pointerover", () => {
        if (diff.id !== difficultyId)
          btn.setStyle({ backgroundColor: "#555555" });
      });
      btn.on("pointerout", () => {
        if (diff.id !== difficultyId)
          btn.setStyle({ backgroundColor: "#444444", color: "#aaaaaa" });
      });
    });
  }

  private async doShare(score: number, difficultyId: string): Promise<void> {
    const difficulty = getDifficultyById(difficultyId);
    const text = `確定申告ランで挑戦！\n難易度: ${difficulty.displayName}\nレシート回収率: ${score}%\n#確定申告ラン`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // キャンセルや非対応は無視
      }
    } else {
      // Web Share API 非対応のときはツイート用 URL
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener");
    }
  }
}
