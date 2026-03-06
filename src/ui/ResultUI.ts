import { difficulties, getDifficultyById } from "../config/difficultyConfig";

interface ResultDetail {
  result: "clear" | "gameover";
  collected: number;
  total: number;
  difficultyId: string;
}

/** リザルト画面のHTML UI管理クラス */
export class ResultUI {
  private screen: HTMLElement;

  constructor() {
    this.screen = document.getElementById("result-screen")!;

    window.addEventListener("kakutei:gameResult", (e) => {
      const detail = (e as CustomEvent<ResultDetail>).detail;
      this.show(detail);
    });
  }

  private show(detail: ResultDetail): void {
    const { result, collected, total, difficultyId } = detail;
    const isClear = result === "clear";
    const score = total > 0 ? Math.floor((collected / total) * 100) : 0;

    const titleEl = document.getElementById("result-title")!;
    titleEl.textContent = isClear ? "クリア！" : "ゲームオーバー";
    titleEl.style.color = isClear ? "#ffee00" : "#ff4444";

    document.getElementById(
      "result-score",
    )!.textContent = `レシート回収率: ${score}%`;
    document.getElementById(
      "result-count",
    )!.textContent = `${collected} / ${total} 枚`;

    this.setupShareButton(score, difficultyId);
    this.buildRetryButtons(difficultyId);

    this.screen.classList.add("visible");
  }

  private hide(): void {
    this.screen.classList.remove("visible");
  }

  private setupShareButton(score: number, difficultyId: string): void {
    const btn = document.getElementById("share-btn")!;
    btn.onclick = () => void this.doShare(score, difficultyId);
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
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noopener");
    }
  }

  private buildRetryButtons(currentDifficultyId: string): void {
    const container = document.getElementById("retry-buttons")!;
    container.innerHTML = "";

    for (const diff of difficulties) {
      const btn = document.createElement("button");
      btn.className = "retry-btn";
      if (diff.id === currentDifficultyId) btn.classList.add("current");
      btn.textContent = diff.displayName;

      btn.addEventListener("click", () => {
        this.hide();
        window.dispatchEvent(
          new CustomEvent("kakutei:retryGame", {
            detail: { difficultyId: diff.id },
          }),
        );
      });

      container.appendChild(btn);
    }
  }
}
