/** ゲームプレイ中のHUD表示（HTMLオーバーレイ要素を更新） */
export class HUD {
  private receiptsEl: HTMLElement;
  private distanceEl: HTMLElement;
  private commentToggleBtn: HTMLElement;
  private canvasObserver: ResizeObserver;

  private collectedCount = 0;
  private totalCount = 0;
  private distance = 0;

  constructor(_scene: unknown, totalReceipts: number) {
    this.totalCount = totalReceipts;

    this.receiptsEl = document.getElementById("hud-receipts")!;
    this.distanceEl = document.getElementById("hud-distance")!;
    this.commentToggleBtn = document.getElementById("comment-toggle-btn")!;

    // キャンバス位置をCSS変数に反映するObserverを設定
    const canvas = document.querySelector("canvas");
    this.canvasObserver = new ResizeObserver(() => {
      this.updateCanvasCssVars();
    });
    if (canvas) {
      this.updateCanvasCssVars();
      this.canvasObserver.observe(canvas);
    } else {
      // キャンバス未取得時はフォールバック値を設定
      document.documentElement.style.setProperty("--canvas-top", "0px");
      document.documentElement.style.setProperty("--canvas-height", "100%");
    }

    document.getElementById("hud-overlay")!.classList.add("visible");
    document.getElementById("pause-btn")!.classList.add("visible");
    this.commentToggleBtn.classList.add("visible");

    this.refresh();
  }

  private updateCanvasCssVars(): void {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    document.documentElement.style.setProperty("--canvas-top", `${rect.top}px`);
    document.documentElement.style.setProperty("--canvas-height", `${rect.height}px`);
  }

  setCollectedCount(n: number): void {
    this.collectedCount = n;
    this.refresh();
  }

  setDistance(px: number): void {
    this.distance = px;
    this.refresh();
  }

  setCommentEnabled(enabled: boolean): void {
    this.commentToggleBtn.style.opacity = enabled ? "1" : "0.4";
  }

  destroy(): void {
    this.canvasObserver.disconnect();
    document.getElementById("hud-overlay")!.classList.remove("visible");
    document.getElementById("pause-btn")!.classList.remove("visible");
    this.commentToggleBtn.classList.remove("visible");
  }

  private refresh(): void {
    this.receiptsEl.textContent = `レシート: ${this.collectedCount} / ${this.totalCount}`;
    this.distanceEl.textContent = `距離: ${Math.floor(this.distance)}m`;
  }
}
