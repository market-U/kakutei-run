import Phaser from "phaser";
import { gameConfig } from "./config/gameConfig";
import { CANVAS_W, CANVAS_H } from "./config/canvasConfig";
import { getDifficultyById } from "./config/difficultyConfig";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { TitleUI } from "./ui/TitleUI";
import { ResultUI } from "./ui/ResultUI";
import { OrientationManager } from "./systems/OrientationManager";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CANVAS_W,
  height: CANVAS_H,
  parent: "game-container",
  backgroundColor: "#87CEEB",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: gameConfig.gravity },
      debug: false,
    },
  },
  scene: [BootScene, GameScene],
};

const game = new Phaser.Game(config);

// HTML UI 層の初期化
new TitleUI();
new ResultUI();
new OrientationManager();

// タイトルからゲーム開始
window.addEventListener("kakutei:startGame", (e) => {
  const { difficultyId } = (e as CustomEvent<{ difficultyId: string }>).detail;
  const difficulty = getDifficultyById(difficultyId);
  game.scene.start("GameScene", { difficulty });
});

// リザルトからリトライ
window.addEventListener("kakutei:retryGame", (e) => {
  const { difficultyId } = (e as CustomEvent<{ difficultyId: string }>).detail;
  const difficulty = getDifficultyById(difficultyId);
  game.scene.start("GameScene", { difficulty });
});

// タイトルへ戻る
window.addEventListener("kakutei:returnToTitle", () => {
  game.scene.stop("GameScene");
});

// 長押し選択禁止
document.onselectstart = function() {
  return false;
}
