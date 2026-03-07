/** ゲームプレイ中のHUD表示（HTMLオーバーレイ要素を更新） */
export class HUD {
  private receiptsEl: HTMLElement;
  private distanceEl: HTMLElement;
  private commentToggleBtn: HTMLElement;

  private collectedCount = 0;
  private totalCount = 0;
  private distance = 0;

  constructor(_scene: unknown, totalReceipts: number) {
    this.totalCount = totalReceipts;

    this.receiptsEl = document.getElementById("hud-receipts")!;
    this.distanceEl = document.getElementById("hud-distance")!;
    this.commentToggleBtn = document.getElementById("comment-toggle-btn")!;

    document.getElementById("hud-overlay")!.classList.add("visible");
    document.getElementById("pause-btn")!.classList.add("visible");
    this.commentToggleBtn.classList.add("visible");

    this.refresh();
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
    document.getElementById("hud-overlay")!.classList.remove("visible");
    document.getElementById("pause-btn")!.classList.remove("visible");
    this.commentToggleBtn.classList.remove("visible");
  }

  private refresh(): void {
    this.receiptsEl.textContent = `レシート: ${this.collectedCount} / ${this.totalCount}`;
    this.distanceEl.textContent = `距離: ${Math.floor(this.distance)}m`;
  }
}
