import { difficulties } from "../config/difficultyConfig";

/** 難易度ボタン群の共通コンポーネント */
export class DifficultyButtons {
  private buttons: HTMLButtonElement[] = [];

  constructor(
    container: HTMLElement,
    onSelect: (difficultyId: string) => void,
  ) {
    container.innerHTML = "";

    for (const diff of difficulties) {
      const btn = document.createElement("button");
      btn.className =
        "btn w-full max-w-xs bg-neutral text-neutral-content hover:bg-neutral-focus border-none text-base bg-red-400/100 hover:bg-red-300";
      btn.textContent = diff.displayName;
      btn.dataset["diffId"] = diff.id;

      btn.addEventListener("click", () => {
        onSelect(diff.id);
      });

      container.appendChild(btn);
      this.buttons.push(btn);
    }
  }

  /** ボタンの有効・無効を切り替える */
  setDisabled(disabled: boolean): void {
    for (const btn of this.buttons) {
      btn.disabled = disabled;
    }
  }
}
