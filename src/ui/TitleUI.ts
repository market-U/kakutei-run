import { difficulties } from "../config/difficultyConfig";

/** タイトル画面のHTML UI管理クラス */
export class TitleUI {
  private selectedDifficultyId = "normal";
  private screen: HTMLElement;
  private diffBtns: HTMLButtonElement[] = [];

  constructor() {
    this.screen = document.getElementById("title-screen")!;

    this.buildDifficultyButtons();
    this.setupStartButton();

    window.addEventListener("kakutei:assetsLoaded", () => this.show());
  }

  private buildDifficultyButtons(): void {
    const container = document.getElementById("difficulty-buttons")!;
    container.innerHTML = "";
    this.diffBtns = [];

    for (const diff of difficulties) {
      const btn = document.createElement("button");
      btn.className = "difficulty-btn";
      btn.textContent = diff.displayName;
      btn.dataset["diffId"] = diff.id;

      btn.addEventListener("click", () => {
        this.selectedDifficultyId = diff.id;
        this.updateHighlights();
      });

      container.appendChild(btn);
      this.diffBtns.push(btn);
    }

    this.updateHighlights();
  }

  private setupStartButton(): void {
    document.getElementById("start-btn")!.addEventListener("click", () => {
      this.hide();
      window.dispatchEvent(
        new CustomEvent("kakutei:startGame", {
          detail: { difficultyId: this.selectedDifficultyId },
        }),
      );
    });
  }

  private updateHighlights(): void {
    for (const btn of this.diffBtns) {
      if (btn.dataset["diffId"] === this.selectedDifficultyId) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    }
  }

  private show(): void {
    this.screen.classList.add("visible");
  }

  private hide(): void {
    this.screen.classList.remove("visible");
  }
}
