import Phaser from "phaser";
import { CANVAS_W, CANVAS_H, GAME_ZONE_Y, GAME_ZONE_HEIGHT } from "../config/canvasConfig";

type Orientation = "portrait" | "landscape";

/** 縦横画面の検知・切り替えを管理するクラス */
export class OrientationManager {
  private game: Phaser.Game;
  private current: Orientation;

  constructor(game: Phaser.Game) {
    this.game = game;
    this.current = this.detect();
    this.applyLayout(this.current);

    // 端末回転の検知（screen.orientation 対応環境）
    if (screen.orientation) {
      screen.orientation.addEventListener("change", () => this.onChanged());
    } else {
      // 古い Safari 向けフォールバック
      window.addEventListener("orientationchange", () => this.onChanged());
    }

    // 手動切り替えボタン
    document
      .getElementById("orientation-toggle")!
      .addEventListener("click", () => this.toggle());
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

  private toggle(): void {
    this.applyLayout(this.current === "portrait" ? "landscape" : "portrait");
    window.dispatchEvent(
      new CustomEvent("kakutei:orientationChanged", {
        detail: { orientation: this.current },
      }),
    );
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

    // body CSS クラスの切り替え
    document.body.classList.remove("portrait", "landscape");
    document.body.classList.add(orientation);

    // Phaser キャンバスサイズとカメラを切り替え
    if (orientation === "landscape") {
      this.game.scale.resize(CANVAS_W, GAME_ZONE_HEIGHT);
      this.applyCamera(CANVAS_W, GAME_ZONE_HEIGHT, GAME_ZONE_Y);
    } else {
      this.game.scale.resize(CANVAS_W, CANVAS_H);
      this.applyCamera(CANVAS_W, CANVAS_H, 0);
    }
  }

  private applyCamera(width: number, height: number, scrollY: number): void {
    // アクティブな全シーンのメインカメラに適用
    this.game.scene.scenes.forEach((scene) => {
      if (!this.game.scene.isActive(scene.scene.key)) return;
      const cam = scene.cameras.main;
      cam.setViewport(0, 0, width, height);
      cam.scrollY = scrollY;
    });
  }
}
