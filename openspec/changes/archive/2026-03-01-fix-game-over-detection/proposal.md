## Why

3回目の魔女被弾後、本来は Enemy が Player に物理的に追いついたときのみゲームオーバーになるべきだが、現在は `onWitchHit` ハンドラーが直接 `onEnemyReached()` を呼び出しているため即座にゲームオーバーになってしまっている（Issue #10）。魔女被弾はすべて同じ処理（腰痛スロー適用）に統一し、ゲームオーバー判定は Enemy と Player の接触によってのみ発火するよう修正する。

## What Changes

- `GameScene.onWitchHit()` から「hitCount >= 3 で `onEnemyReached()` を呼ぶ」分岐を削除し、3回目も同一の腰痛スロー処理を適用する
- ゲームオーバーは `CollisionManager.checkEnemyReached()` による接触判定のみで発火する
- 魔女被弾回数による即死ロジックがなくなるため、3回目の腰痛スロー中に Enemy が追いつけばゲームオーバー、追いつかなければゲームが継続する

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `scenes`: ゲームオーバー判定条件を変更。魔女3回被弾による即座のゲームオーバーを廃止し、Enemy・Player 接触のみをゲームオーバートリガーとする要件に更新する

## Impact

- `src/scenes/GameScene.ts` ― `onWitchHit` メソッドの分岐ロジック削除
- `openspec/specs/scenes/spec.md` ― ゲームオーバー条件のシナリオ更新
- デグレ箇所の特定：`onWitchHit` への即死ロジック追加は `2026-03-01-state-based-sprite-animation` 以前のいずれかの change で混入した可能性があるため、アーカイブの tasks.md を確認する
