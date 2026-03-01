# Tasks: fix-goal-detection

## 1. 税務署表示位置の修正

- [x] 1.1 `GameScene.ts` の税務署スプライト生成の Y 座標を `GROUND_Y - 64` → `GROUND_Y` に修正する（`setOrigin(0.5, 1)` により底辺が `GROUND_Y` に揃う）

## 2. ゴール判定の状態条件を拡張

- [x] 2.1 `GameScene.ts` の `update()` 内ゴール到達チェックの条件を `state === "playing"` から `state === "playing" || state === "back_pain_slow"` に変更する
