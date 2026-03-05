# Proposal: issue-26-delay-scroll-stop-on-fall

## Why

石ころに躓いた瞬間にスクロールが即停止するため、プレーヤーがその場でずっこける不自然な見た目になっている。
転倒アニメーション（`player_fall`）が完了するまでスクロールを継続することで、慣性のある自然な転倒表現を実現する。

## What Changes

- `GameScene` に新状態 `"stone_fall_coasting"` を追加し、転倒アニメーション再生中はスクロールを継続する
- 転倒アニメーション完了時に `scrollManager.stop()` を呼び出すよう変更する（現在は `onStoneHit()` で即停止）
- `CollisionManager.checkStones()` から `enemy.startChasing()` の呼び出しを削除し、スクロール停止後（アニメーション完了後）に `GameScene` 側で呼び出す設計に変更する
- `update()` ループで `"stone_fall_coasting"` 状態のときもスクロールを処理するよう分岐を追加する

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `player-mechanics`: 石ころ被弾時の転倒トリガー仕様を変更。スクロールは転倒アニメーション完了まで継続し、完了後にスクロール停止・敵追跡が開始される。

## Impact

- `src/scenes/GameScene.ts` — `GameState` 型、`onStoneHit()`、`update()` を変更
- `src/systems/CollisionManager.ts` — `checkStones()` から `enemy.startChasing()` を削除
- `openspec/specs/player-mechanics/spec.md` — 石ころ被弾時のスクロール継続仕様を追記
