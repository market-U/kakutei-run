# Proposal: fix-enemy-depth-and-collision

## Why

Enemy（追跡キャラ）がプレーヤーより背面（低い depth）に描画されており、追跡時にプレーヤーの裏に隠れてしまう。また Enemy の衝突判定が X 座標の閾値（`this.x >= CANVAS_WIDTH / 2 - 10`）による距離ベース判定であり、スプライト同士が視覚的に重なっていなくても判定が発火する不自然な挙動がある。Enemy の描画順と衝突判定を改善し、ゲームの手触りを向上させる。

## What Changes

- Enemy の描画 depth をプレーヤーより高い値に変更し、プレーヤーの手前に表示されるようにする
- Enemy の衝突判定を距離ベースの閾値判定から、Player と Enemy の矩形同士が接触したときに発火する AABB 交差判定に変更する
- Witch・Stone・Receipt・Player の depth および衝突判定は変更しない

## Capabilities

### New Capabilities

### Modified Capabilities

- `scenes`: Enemy の描画順（depth）と衝突判定方式の要件を変更

## Impact

- `src/objects/Enemy.ts` — depth 値の変更、`getHitBounds()` メソッドの追加、`hasReachedPlayer()` の削除
- `src/systems/CollisionManager.ts` — `checkEnemyReached()` を矩形オーバーラップ判定に変更
- 既存テスト — `CollisionManager.test.ts` の Enemy 判定テストの調整が必要な可能性
