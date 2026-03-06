import { describe, it, expect } from "vitest";
import { MapGenerator } from "../MapGenerator";
import { getDifficultyById } from "../../config/difficultyConfig";
import { gameConfig } from "../../config/gameConfig";

const normalDiff = getDifficultyById("normal");

describe("MapGenerator", () => {
  it("生成結果に stone・receipt・witch が含まれる", () => {
    const gen = new MapGenerator(normalDiff);
    const placed = gen.generate();
    expect(placed.some((o) => o.type === "stone")).toBe(true);
    expect(placed.some((o) => o.type === "receipt")).toBe(true);
    expect(placed.some((o) => o.type === "witch")).toBe(true);
  });

  it("すべてのオブジェクトはゲーム開始直後の画面（960px）より右に配置される", () => {
    const CANVAS_W = 960;
    const gen = new MapGenerator(normalDiff, 540, CANVAS_W);
    const placed = gen.generate();
    for (const obj of placed) {
      expect(obj.worldX).toBeGreaterThanOrEqual(CANVAS_W);
    }
  });

  it("レシート数は difficultyConfig の receiptCount と一致する", () => {
    const gen = new MapGenerator(normalDiff);
    const placed = gen.generate();
    const receipts = placed.filter((o) => o.type === "receipt");
    expect(receipts.length).toBe(normalDiff.receiptCount);
  });

  it("任意のオブジェクト間の直線距離が objectMinDistance 以上である", () => {
    const gen = new MapGenerator(normalDiff);
    const placed = gen.generate();
    const minDist = gameConfig.objectMinDistance;

    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i];
        const b = placed[j];
        const dx = a.worldX - b.worldX;
        const dy = a.worldY - b.worldY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        expect(dist).toBeGreaterThanOrEqual(minDist - 0.001); // 浮動小数点の誤差を許容
      }
    }
  });

  it("すべてのオブジェクトはゴール（stageLength）から600px以上離れて配置される", () => {
    const gen = new MapGenerator(normalDiff);
    const placed = gen.generate();
    for (const obj of placed) {
      expect(obj.worldX).toBeGreaterThanOrEqual(0);
      expect(obj.worldX).toBeLessThanOrEqual(normalDiff.stageLength - 600);
    }
  });
});
