import { DifficultyButtons } from "./DifficultyButtons";

declare const __APP_VERSION__: string;

/** タイトル画面のHTML UI管理クラス */
export class TitleUI {
  private screen: HTMLElement;

  constructor() {
    this.screen = document.getElementById("title-screen")!;

    const container = document.getElementById("difficulty-buttons")!;
    new DifficultyButtons(container, (difficultyId) => {
      this.hide();
      window.dispatchEvent(
        new CustomEvent("kakutei:startGame", {
          detail: { difficultyId },
        }),
      );
    });

    const versionEl = document.getElementById("app-version");
    if (versionEl) versionEl.textContent = `v${__APP_VERSION__}`;

    window.addEventListener("kakutei:assetsLoaded", () => this.show());
  }

  private show(): void {
    this.screen.classList.add("visible");
  }

  private hide(): void {
    this.screen.classList.remove("visible");
  }
}
