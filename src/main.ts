import Phaser from "phaser";
import { gameConfig } from "./config/gameConfig";
import { CANVAS_W, CANVAS_H } from "./config/canvasConfig";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";
import { GameScene } from "./scenes/GameScene";
import { ResultScene } from "./scenes/ResultScene";

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
  scene: [BootScene, TitleScene, GameScene, ResultScene],
};

new Phaser.Game(config);
