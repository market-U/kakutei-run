import { DifficultyButtons } from "./DifficultyButtons";
import { loadCommentsData } from "../systems/CommentManager";

declare const __APP_VERSION__: string;

/** タイトル画面のHTML UI管理クラス */
export class TitleUI {
  private screen: HTMLElement;

  constructor() {
    this.screen = document.getElementById("title-screen")!;

    const versionEl = document.getElementById("app-version");
    if (versionEl) versionEl.textContent = `v${__APP_VERSION__}`;

    window.addEventListener("kakutei:assetsLoaded", () => void this.show());
    window.addEventListener("kakutei:returnToTitle", () => void this.show());
  }

  private async show(): Promise<void> {
    this.screen.classList.add("visible");

    // コメントデータ取得中はスピナーを表示してゲーム開始をブロック
    const container = document.getElementById("difficulty-buttons")!;
    container.innerHTML =
      '<span class="loading loading-spinner loading-lg text-red-400"></span>';

    await loadCommentsData();

    // 取得完了後にボタンを表示
    new DifficultyButtons(container, (difficultyId) => {
      this.hide();
      window.dispatchEvent(
        new CustomEvent("kakutei:startGame", {
          detail: { difficultyId },
        }),
      );
    });
  }

  private hide(): void {
    this.screen.classList.remove("visible");
  }
}
