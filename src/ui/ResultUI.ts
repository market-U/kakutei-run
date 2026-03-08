import { getDifficultyById } from "../config/difficultyConfig";
import { DifficultyButtons } from "./DifficultyButtons";

declare const __APP_VERSION__: string;

interface ResultDetail {
  result: "clear" | "gameover";
  collected: number;
  total: number;
  difficultyId: string;
  shareComment: string | null;
}

/** リザルト画面のHTML UI管理クラス */
export class ResultUI {
  private screen: HTMLElement;

  /** シェア用画像の生成 Promise（リザルト表示と同時に開始、doShare で await する） */
  private shareImagePromise: Promise<File | null> | null = null;

  constructor() {
    this.screen = document.getElementById("result-screen")!;

    window.addEventListener("kakutei:gameResult", (e) => {
      const detail = (e as CustomEvent<ResultDetail>).detail;
      this.show(detail);
    });
  }

  private show(detail: ResultDetail): void {
    const { result, collected, total, difficultyId, shareComment } = detail;
    const isClear = result === "clear";
    const score = total > 0 ? Math.floor((collected / total) * 100) : 0;

    const titleEl = document.getElementById("result-title")!;
    titleEl.textContent = isClear ? "確定おめでとう！" : "確定ならず…";
    titleEl.style.color = isClear ? "#d7e633" : "#4ea8ed";

    const difficultyEl = document.getElementById("result-difficulty")!;
    const difficulty = getDifficultyById(difficultyId);
    difficultyEl.textContent = difficulty.displayName;
    difficultyEl.style.color = titleEl.style.color;
    const crownEl = document.getElementById("result-crown")!;
    if (isClear) {
      crownEl.classList.remove("hidden");
    } else {
      crownEl.classList.add("hidden");
    }
    document.getElementById(
      "result-score",
    )!.textContent = `レシート回収率: ${score}%`;
    document.getElementById(
      "result-count",
    )!.textContent = `${collected} / ${total} 枚`;

    this.setupShareButton(score, difficultyId, isClear);

    // リザルト画面表示と同時に画像生成を開始し Promise を保持する。
    // シェアボタンを即押しされても await で自然に待機できる。
    this.shareImagePromise = this.generateShareImage(isClear, score, difficulty.displayName, shareComment);

    const retryContainer = document.getElementById("retry-buttons")!;
    new DifficultyButtons(retryContainer, (selectedDifficultyId) => {
      this.hide();
      window.dispatchEvent(
        new CustomEvent("kakutei:retryGame", {
          detail: { difficultyId: selectedDifficultyId },
        }),
      );
    });

    this.screen.classList.add("visible");
  }

  private hide(): void {
    this.screen.classList.remove("visible");
  }

  private setupShareButton(
    score: number,
    difficultyId: string,
    isClear: boolean,
  ): void {
    const btn = document.getElementById("share-btn")!;
    btn.onclick = () => void this.doShare(score, difficultyId, isClear);
  }

  /**
   * シェア用画像を Canvas API で生成する（1080×1080px）。
   * クリア / ゲームオーバーのベース画像に難易度・スコア・コメント・バージョンをオーバーレイする。
   */
  private async generateShareImage(
    isClear: boolean,
    score: number,
    difficultyName: string,
    shareComment: string | null,
  ): Promise<File | null> {
    try {
      const SIZE = 1080;
      const basePath = isClear
        ? "/assets/ui/share_clear.png"
        : "/assets/ui/share_gameover.png";

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = basePath;
      });

      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d")!;

      // ベース画像を描画
      ctx.drawImage(img, 0, 0, SIZE, SIZE);

      // 難易度名を上部に描画
      ctx.font = "bold 56px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 6;
      ctx.textAlign = "left";
      ctx.strokeText(difficultyName, 48, 88);
      ctx.fillText(difficultyName, 48, 88);

      // スコア・コメント・バージョンを下部に描画
      const bottomY = SIZE - 48;

      // バージョン
      ctx.font = "36px sans-serif";
      ctx.textAlign = "right";
      ctx.strokeText(`v${__APP_VERSION__}`, SIZE - 48, bottomY);
      ctx.fillText(`v${__APP_VERSION__}`, SIZE - 48, bottomY);

      // スコア
      ctx.font = "bold 60px sans-serif";
      ctx.textAlign = "left";
      const scoreText = `レシート取得率: ${score}%`;
      ctx.strokeText(scoreText, 48, bottomY - 120);
      ctx.fillText(scoreText, 48, bottomY - 120);

      // コメント
      if (shareComment) {
        ctx.font = "italic 44px sans-serif";
        ctx.strokeText(`「${shareComment}」`, 48, bottomY - 56);
        ctx.fillText(`「${shareComment}」`, 48, bottomY - 56);
      }

      return await new Promise<File | null>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(null); return; }
          resolve(new File([blob], "kakutei-run-result.png", { type: "image/png" }));
        }, "image/png");
      });
    } catch {
      return null;
    }
  }

  /**
   * =====================================================
   * シェア内容を変更したい場合はこのメソッドを編集してください。
   * テキスト・画像・ハッシュタグなどすべてのシェア設定がここに集約されています。
   * =====================================================
   */
  private async doShare(
    score: number,
    difficultyId: string,
    isClear: boolean,
  ): Promise<void> {
    const difficulty = getDifficultyById(difficultyId);
    const phrase = isClear
      ? `${difficulty.displayName} 確定成功！`
      : `${difficulty.displayName} 確定ならず…`;

    const text = [
      phrase,
      `レシート取得率: ${score}%`,
      ``,
      `v${__APP_VERSION__} | ${window.location.href}`,
      `#確定RUN`,
    ].join("\n");

    // 画像生成が完了するまで待機（生成中にボタンを押された場合も自然に待つ）
    const imageFile = await this.shareImagePromise;

    if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
      try {
        await navigator.share({ files: [imageFile], text });
      } catch {
        // キャンセルや非対応は無視
      }
    } else {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener");
    }
  }
}
