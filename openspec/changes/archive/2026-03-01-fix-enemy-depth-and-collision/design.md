# Design: fix-enemy-depth-and-collision

## Context

現在のゲームは Phaser 3 の `setDepth()` で描画順を制御している。各オブジェクトの depth は以下のとおり：

| オブジェクト          | 現在の depth |
| --------------------- | ------------ |
| 背景（ScrollManager） | 0-2          |
| Stone                 | 5            |
| Receipt               | 5            |
| ゴール（税務署）      | 5            |
| Witch                 | 6            |
| Enemy                 | 8            |
| Player                | 10           |
| HUD                   | 20           |
| クリア演出            | 29-30        |

Player（depth 10）が Enemy（depth 8）より高いため、Enemy はプレーヤーの背面に描画される。

Enemy の衝突判定は `CollisionManager.checkEnemyReached()` で `enemy.hasReachedPlayer()` を呼び出しており、内部では `this.x >= CANVAS_WIDTH / 2 - 10` という X 座標の閾値判定を行っている。これは矩形同士の接触ではなく固定ピクセル値による距離判定のため、スプライトが視覚的に重なっていなくても判定が発火したり、逆に重なっていても発火しなかったりする不自然な挙動がある。

## Goals / Non-Goals

**Goals:**

- Enemy をプレーヤーより手前（高い depth）に描画する
- Enemy の衝突判定を、X 座標閾値ベースから Player-Enemy 間の矩形オーバーラップ（AABB 交差判定）に変更する

**Non-Goals:**

- Player・Witch・Stone・Receipt の depth 変更
- Stone・Witch の `getHitBounds()` 変更（現在の縮小係数を維持する）
- Receipt のヒットボックス変更
- `rectsOverlap()` のアルゴリズム変更（既存の AABB 交差判定をそのまま利用する）
- ピクセルパーフェクト衝突判定の導入

## Decisions

### 1. Enemy の depth を Player より高く設定

Enemy の depth のみを Player より高い値に変更する。他オブジェクトの depth は変更しない。

| オブジェクト | 現在 | 変更後         |
| ------------ | ---- | -------------- |
| Player       | 10   | 10（変更なし） |
| Enemy        | 8    | 11             |

**理由**: Enemy だけを 1 段上げるのが最小変更。Player（10）を含む他オブジェクトの depth に影響を与えず、HUD（20）やクリア演出（29-30）とも干渉しない。

**代替案**: Player の depth を下げる方法もあるが、他オブジェクトとの前後関係に波及するため Enemy のみ上げる方がシンプル。

### 2. Enemy の衝突判定を矩形オーバーラップに変更

Enemy に `getHitBounds()` メソッドを追加し、`CollisionManager.checkEnemyReached()` で `rectsOverlap()` を使った矩形交差判定に変更する。

- Enemy に `getHitBounds()` を追加（`displayWidth * 0.8` × `displayHeight * 0.8` のヒットボックス）
- `CollisionManager.checkEnemyReached()` を `player.getBounds()` と `enemy.getHitBounds()` の `rectsOverlap()` に変更
- `Enemy.hasReachedPlayer()` は不要になるため削除

**理由**: 他の障害物（Stone, Witch, Receipt）と同じ `rectsOverlap()` ベースの判定に統一することで、一貫性が向上し判定の正確さもスプライトの視覚的な接触に基づくようになる。

**代替案**: `hasReachedPlayer()` 内の閾値を調整する方法もあるが、スプライトサイズが変わった場合に追従できず根本的な解決にならない。

## Risks / Trade-offs

- [Enemy 判定タイミングの変化] → 矩形ベースに変わることで、従来よりやや遅く（スプライトが実際に重なるまで）判定されるようになる。ゲームオーバーのタイミングがわずかに変わる可能性がある。
- [既存テストへの影響] → `CollisionManager.test.ts` の `checkEnemyReached` テストが `hasReachedPlayer()` に依存している場合、修正が必要。
- [depth 変更による視覚的な違和感] → Enemy が Player の手前に来ることで、追跡時にプレーヤーが隠れて見づらくなる可能性がある。実際にプレイして確認が必要。
