## Context

`GameScene.onWitchHit()` は魔女被弾イベント (`witchHit`) を受け取り、`hitCount >= 3` のとき直接 `onEnemyReached()` を呼び出している。これにより Enemy が物理的に Player に到達していなくてもゲームオーバーになるバグが発生している（Issue #10）。

本来のゲームオーバーフローは次の通り：
1. 魔女に当たる → `player.activateBackPain()` → `backPainActivated` イベント → `onBackPainStart()` でスクロール減速 + `enemy.applyWitchHit()` で Enemy が接近
2. Enemy が Player の矩形に重なる → `CollisionManager.checkEnemyReached()` → `enemyReached` イベント → `onEnemyReached()` でゲームオーバー

`onWitchHit` は本来この中間にある不要なショートカットであり、取り除くだけで正しい挙動になる。

## Goals / Non-Goals

**Goals:**
- 魔女3回被弾時の即座ゲームオーバーを廃止する
- 魔女被弾（1〜3回すべて）を同一処理（腰痛スロー適用）に統一する
- ゲームオーバーは Enemy・Player の矩形接触のみで発火させる

**Non-Goals:**
- 魔女被弾回数の上限・下限変更
- 腰痛スロー時間・Enemy の接近速度の変更
- `CollisionManager.checkEnemyReached()` の判定ロジック変更
- デグレ混入 change の特定（調査のみ、コード修正対象外）

## Decisions

### `onWitchHit` の `hitCount >= 3` 分岐を削除

**Decision**: `GameScene.onWitchHit()` の `if (hitCount >= 3) { this.onEnemyReached(); }` ブロックをまるごと削除する。

**Rationale**: `checkWitches` が `player.activateBackPain()` を呼び出す時点で `backPainActivated` イベント経由で `onBackPainStart` が実行され、Enemy の接近処理も含めて完結している。`onWitchHit` に追加ロジックは本来不要。削除のみで副作用がなく、テスト対象も局所化できる。

**Alternatives considered**:
- `onWitchHit` を完全に削除しイベントリスナー登録も削除する：将来的に UI 表示（被弾回数のフィードバック等）で `witchHit` イベントを使う可能性があるため、今回はメソッド自体は残してロジック削除にとどめる

## Risks / Trade-offs

- [Risk] `onWitchHit` のメソッドが空になることで将来の開発者が混乱する可能性 → コメントで「ゲームオーバーは CollisionManager の接触判定に委ねる」旨を記載する
- [Risk] 3回被弾後に Enemy が追いつかずゲームが長引く可能性 → 意図した動作。難易度調整は別 change の範囲
