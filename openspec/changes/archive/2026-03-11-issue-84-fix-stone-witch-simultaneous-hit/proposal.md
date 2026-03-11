# Proposal: issue-84-fix-stone-witch-simultaneous-hit

## Why

石ころと魔女が近接配置された場合、同一フレーム内で両方の当たり判定が処理され、
石ころ被弾後に開始した `player_fall` アニメーションが魔女被弾処理によって上書き・停止される。
その結果 `animationcomplete-player_fall` イベントが発火せず、
ゲームが `stone_fall_coasting` 状態のまま永続し、石・ゴールの当たり判定が失われたまま
フェールセーフ（scrolledX > stageLength + 500）が発動するまで走り続けるバグを修正する。

## What Changes

- `PlayerStateManager.activateBackPain()` に `_falling` ガードを追加する
  - プレイヤーが転倒中（`_falling === true`）の場合、魔女被弾によるアニメーション変更・腰痛発動を無効化する
  - 魔女オブジェクト自体は消費済みになる（`CollisionManager.checkWitches()` で `witch.consume()` が呼ばれる）
  - 転倒中の魔女被弾は無敵扱いとし、腰痛ペナルティを与えない

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `player-mechanics`: 転倒中（falling状態）の魔女被弾を無効化するという要件を追加する
- `obstacles`: 石ころ・魔女の同時被弾時の挙動仕様を明確化する

## Impact

- `src/objects/PlayerStateManager.ts` — `activateBackPain()` に `_falling` チェックを追加
- `src/objects/Player.ts` — 変更なし（`activateBackPain()` が "none" を返せば既存ガードで対応済み）
- ゲームバランスへの影響: 石ころと魔女が密接配置された場合に魔女ペナルティが発生しなくなるが、
  これは転倒中の無敵という既存の設計意図（design.md Decision 3 参照）と一致する
