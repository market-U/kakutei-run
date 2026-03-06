type Orientation = "portrait" | "landscape";

/** 縦横画面の検知・切り替えを管理するクラス */
export class OrientationManager {
  private current: Orientation;

  constructor() {
    this.current = this.detect();
    this.applyLayout(this.current);

    // 端末回転の検知（screen.orientation 対応環境）
    if (screen.orientation) {
      screen.orientation.addEventListener("change", () => this.onChanged());
    } else {
      // 古い Safari 向けフォールバック
      window.addEventListener("orientationchange", () => this.onChanged());
    }

  }

  private detect(): Orientation {
    if (screen.orientation) {
      return screen.orientation.type.startsWith("landscape")
        ? "landscape"
        : "portrait";
    }
    // window.orientation フォールバック（非推奨だが広くサポート）
    return Math.abs((window as Window & { orientation?: number }).orientation ?? 0) === 90
      ? "landscape"
      : "portrait";
  }

  private onChanged(): void {
    const next = this.detect();
    if (next === this.current) return;
    this.applyLayout(next);
    window.dispatchEvent(
      new CustomEvent("kakutei:orientationChanged", {
        detail: { orientation: this.current },
      }),
    );
  }

  private applyLayout(orientation: Orientation): void {
    this.current = orientation;
    // body CSS クラスの切り替え（Scale.FIT が画面サイズに合わせて自動スケーリング）
    document.body.classList.remove("portrait", "landscape");
    document.body.classList.add(orientation);
  }
}
