import { describe, it, expect } from "vitest";
import { getDifficultyById, difficulties } from "../difficultyConfig";

describe("getDifficultyById", () => {
  it("easy を取得できる", () => {
    const entry = getDifficultyById("easy");
    expect(entry.id).toBe("easy");
    expect(entry.displayName).toBe("Easy");
  });

  it("normal を取得できる", () => {
    const entry = getDifficultyById("normal");
    expect(entry.id).toBe("normal");
  });

  it("hard を取得できる", () => {
    const entry = getDifficultyById("hard");
    expect(entry.id).toBe("hard");
  });

  it("存在しない id は Error を投げる", () => {
    expect(() => getDifficultyById("unknown")).toThrowError(
      /Unknown difficulty id/,
    );
  });

  it("空文字は Error を投げる", () => {
    expect(() => getDifficultyById("")).toThrowError();
  });

  it("デフォルトで 3 難易度が定義されている", () => {
    expect(difficulties).toHaveLength(3);
  });

  it("各エントリの scrollSpeed は正の数", () => {
    for (const d of difficulties) {
      expect(d.scrollSpeed).toBeGreaterThan(0);
    }
  });

  it("各エントリの stageLength は正の数", () => {
    for (const d of difficulties) {
      expect(d.stageLength).toBeGreaterThan(0);
    }
  });
});
