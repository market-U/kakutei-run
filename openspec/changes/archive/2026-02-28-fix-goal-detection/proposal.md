# Proposal: fix-goal-detection

## Why

税務署（ゴール）を素通りしてもゲームがクリアにならないバグが発生している。
原因は2つあり、①税務署の表示位置が地面から浮いてしまっている、②ゴール判定が `state === "playing"` 限定のため腰痛スロー中はクリアにならない。

## What Changes

- 税務署スプライトの Y 座標を `GROUND_Y - 64` → `GROUND_Y` に修正し、地面に接地させる
- `onGoalReached()` の呼び出し条件を `state === "playing" || state === "back_pain_slow"` に拡張して、腰痛スロー中でもゴール判定が発火するようにする

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `scenes`: ゴール判定ロジックと税務署表示 Y 座標の修正

## Impact

- `src/scenes/GameScene.ts` — 税務署 Y 座標の修正、ゴール判定 state 条件の拡張
