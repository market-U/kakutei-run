import { gameConfig } from "../config/gameConfig";
import { GROUND_HEIGHT } from "./ScrollManager";
import type { DifficultyEntry } from "../config/difficultyConfig";

/** ワールド内のオブジェクト配置情報 */
export interface PlacedObject {
  worldX: number;
  worldY: number;
  type: "stone" | "witch" | "receipt";
}

/**
 * ステージのランダムマップを生成するクラス。
 * Phaser に依存せず純粋なロジックとして実装（ユニットテスト可能）。
 */
export class MapGenerator {
  private readonly difficulty: DifficultyEntry;
  private readonly canvasWidth: number;
  private readonly groundY: number;

  constructor(
    difficulty: DifficultyEntry,
    canvasHeight = 540,
    canvasWidth = 960,
  ) {
    this.difficulty = difficulty;
    this.canvasWidth = canvasWidth;
    this.groundY = canvasHeight - GROUND_HEIGHT; // 地面上端
  }

  /**
   * ステージ全体のオブジェクト配置リストを生成する
   */
  generate(): PlacedObject[] {
    const placed: PlacedObject[] = [];

    // 石ころ
    const stoneCount = Math.round(
      (this.difficulty.stageLength / 1000) * this.difficulty.stoneFrequency,
    );
    for (let i = 0; i < stoneCount; i++) {
      const pos = this.findPosition("stone", placed);
      if (pos) {
        placed.push({
          worldX: pos.x,
          worldY: this.groundY - 16,
          type: "stone",
        });
      }
    }

    // レシート
    for (let i = 0; i < this.difficulty.receiptCount; i++) {
      const pos = this.findPosition("receipt", placed);
      if (pos) {
        placed.push({ worldX: pos.x, worldY: pos.y, type: "receipt" });
      }
    }

    // 魔女
    const witchCount = Math.round(
      (this.difficulty.stageLength / 1000) * this.difficulty.witchFrequency,
    );
    for (let i = 0; i < witchCount; i++) {
      const pos = this.findPosition("witch", placed);
      if (pos) {
        placed.push({ worldX: pos.x, worldY: pos.y, type: "witch" });
      }
    }

    return placed;
  }

  /**
   * 既存オブジェクトと `objectMinDistance` 以上離れた配置位置を探す。
   * 見つからない場合は null を返す。
   * 石ころは スタートから 200px 以内を除外する。
   */
  private findPosition(
    type: "stone" | "receipt" | "witch",
    existing: PlacedObject[],
  ): { x: number; y: number } | null {
    // ゲーム開始直後の画面（canvasWidth px 分）にオブジェクトが出ないよう minX を画面幅以上にする
    const minX = this.canvasWidth;
    const maxX = this.difficulty.stageLength - 600;
    const minDist = gameConfig.objectMinDistance;

    for (let attempt = 0; attempt < 100; attempt++) {
      const x = minX + Math.random() * (maxX - minX);
      // y は実際の配置値を計算してから距離チェックに使う
      let y: number;
      if (type === "stone") {
        y = this.groundY - 16;
      } else if (type === "receipt") {
        y =
          gameConfig.receiptYMin +
          Math.random() * (gameConfig.receiptYMax - gameConfig.receiptYMin);
      } else {
        // witch
        y =
          gameConfig.witchYMin +
          Math.random() * (gameConfig.witchYMax - gameConfig.witchYMin);
      }

      if (this.isFarEnough(x, y, existing, minDist)) {
        return { x, y };
      }
    }
    return null; // 100回試行で見つからなければスキップ
  }

  private isFarEnough(
    x: number,
    y: number,
    existing: PlacedObject[],
    minDist: number,
  ): boolean {
    for (const obj of existing) {
      const dx = x - obj.worldX;
      const dy = y - obj.worldY;
      if (Math.sqrt(dx * dx + dy * dy) < minDist) {
        return false;
      }
    }
    return true;
  }
}
