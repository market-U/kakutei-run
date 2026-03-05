# Proposal: issue-31-fix-scroll-stop-on-stone-hit

## Why

腰痛スロー状態（`back_pain_slow`）中に石ころへ被弾すると、`onStoneHit` のガードが `"playing"` 状態のみを通過させる実装のため、転倒後もスクロールが停止しない不具合がある（Issue #31）。
また、状態遷移に考慮漏れが生じた場合に永遠にスクロールが続くリスクを抑えるセーフネット機構も同時に導入し、ゲームが正常に終了しない事態を防ぐ。

## What Changes

- `onStoneHit` のガード条件を拡張し、`back_pain_slow` 状態でも転倒処理を正常に起動できるようにする
- `back_pain_slow` 中の被弾時に腰痛タイムダウンタイマー（`delayedCall`）を明示的にキャンセルし、状態の整合性を保証する
- スクロール累積距離が `stageLength + 500 px` を超過した場合に強制的に `game_over` 扱いでゲームを終了させるセーフネットを追加する

## Capabilities

### New Capabilities

- なし

### Modified Capabilities

- `scenes`: ゲームシーンの状態遷移要件を変更する（`back_pain_slow` → `stone_fall_coasting` 遷移の追加、最大スクロール距離超過によるゲーム強制終了の追加）

## Impact

- `src/scenes/GameScene.ts`: `onStoneHit`・`onBackPainStart`・`update` の修正
- `openspec/specs/scenes/spec.md`: 状態遷移仕様の追記
