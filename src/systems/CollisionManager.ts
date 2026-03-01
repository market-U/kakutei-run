import Phaser from "phaser";
import type { Player } from "../objects/Player";
import type { Stone } from "../objects/Stone";
import type { Witch } from "../objects/Witch";
import type { Receipt } from "../objects/Receipt";
import type { Enemy } from "../objects/Enemy";

/** 矩形オーバーラップ判定の純粋関数（ユニットテスト可能） */
export function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * プレーヤーと各オブジェクトの衝突ハンドラーを集約するクラス。
 * Phaser の physics collider ではなく矩形オーバーラップで判定する。
 */
export class CollisionManager {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly enemy: Enemy,
  ) {}

  checkStones(stones: Stone[]): void {
    const pb = this.player.getBounds();
    for (const stone of stones) {
      if (stone.isConsumed()) continue;
      if (rectsOverlap(pb, stone.getHitBounds())) {
        stone.consume();
        this.player.triggerFall();
        this.enemy.startChasing();
        this.scene.events.emit("stoneHit");
        return;
      }
    }
  }

  checkWitches(witches: Witch[]): void {
    const pb = this.player.getBounds();
    for (const witch of witches) {
      if (witch.isConsumed()) continue;
      if (rectsOverlap(pb, witch.getHitBounds())) {
        witch.consume();
        this.player.activateBackPain();
        this.scene.events.emit("witchHit", this.player.getWitchHitCount());
        return;
      }
    }
  }

  checkReceipts(receipts: Receipt[]): void {
    const pb = this.player.getBounds();
    for (const receipt of receipts) {
      if (receipt.isCollected()) continue;
      if (rectsOverlap(pb, receipt.getHitBounds())) {
        receipt.collect();
        this.scene.events.emit("receiptCollected");
      }
    }
  }

  checkEnemyReached(): void {
    const pb = this.player.getBounds();
    const eb = this.enemy.getHitBounds();
    if (rectsOverlap(pb, eb)) {
      this.scene.events.emit("enemyReached");
    }
  }
}
