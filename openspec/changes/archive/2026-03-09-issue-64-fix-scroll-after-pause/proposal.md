# Pause復帰後のスクロール停止バグを修正する

## Why

ポーズから復帰した際に `ScrollManager.resume()` が呼ばれず、`active` フラグが `false` のままになるため、`ground` / `bg-far` / `bg-near` のスクロールが再開されない。

## What Changes

- `GameScene.resume()` 内で `scrollManager.setSpeed()` に加えて `scrollManager.resume()` を呼び出し、`active` フラグを `true` に戻す。

## Capabilities

### New Capabilities

なし

### Modified Capabilities

なし（実装バグの修正のみ。仕様変更なし）

## Impact

- [src/scenes/GameScene.ts](src/scenes/GameScene.ts) の `resume()` メソッド（1行追加）
