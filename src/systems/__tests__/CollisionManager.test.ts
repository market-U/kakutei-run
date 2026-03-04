import { describe, it, expect } from "vitest";
import { rectsOverlap } from "../CollisionManager";

type Rect = { x: number; y: number; width: number; height: number };

describe("rectsOverlap", () => {
  it("重なっている場合は true を返す", () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 50, y: 50, width: 100, height: 100 };
    expect(rectsOverlap(a, b)).toBe(true);
  });

  it("完全に分離している場合は false を返す", () => {
    const a: Rect = { x: 0, y: 0, width: 50, height: 50 };
    const b: Rect = { x: 100, y: 100, width: 50, height: 50 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it("X 方向で隣接（非重複）は false を返す", () => {
    const a: Rect = { x: 0, y: 0, width: 50, height: 50 };
    const b: Rect = { x: 50, y: 0, width: 50, height: 50 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it("Y 方向で隣接（非重複）は false を返す", () => {
    const a: Rect = { x: 0, y: 0, width: 50, height: 50 };
    const b: Rect = { x: 0, y: 50, width: 50, height: 50 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it("一方が他方を完全に内包する場合は true を返す", () => {
    const outer: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const inner: Rect = { x: 25, y: 25, width: 50, height: 50 };
    expect(rectsOverlap(outer, inner)).toBe(true);
    expect(rectsOverlap(inner, outer)).toBe(true);
  });

  it("左端だけが重なる場合は true を返す", () => {
    const a: Rect = { x: 0, y: 0, width: 51, height: 50 };
    const b: Rect = { x: 50, y: 0, width: 50, height: 50 };
    expect(rectsOverlap(a, b)).toBe(true);
  });
});

/**
 * Enemy.stopChasing() 後のアニメーション停止
 *
 * Enemy は Phaser.GameObjects.Sprite を継承しているため、
 * node テスト環境では Phaser を利用できずインスタンス化できない。
 * 以下のシナリオはゲーム実行時の統合テスト・手動確認で検証する。
 *   - Enemy.stopChasing() を呼ぶと this.anims.stop() が実行されること
 *   - GameScene.onEnemyReached() 内で enemy.stopChasing() に加え
 *     player.anims.stop() も呼ばれること
 */
describe("Enemy アニメーション停止（統合テスト要件）", () => {
  it.todo(
    "Enemy.stopChasing() 後に anims.stop() が呼ばれること（Phaser 依存 → 統合テストで確認）",
  );
  it.todo(
    "onEnemyReached イベント後に Player のアニメーションも停止すること（Phaser 依存 → 統合テストで確認）",
  );
});
