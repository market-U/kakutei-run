# Pause復帰後スクロール停止バグ 設計

## Context

`ScrollManager` は `active` フラグで更新の有無を制御する。`stop()` で `false`、`resume()` で `true` に戻す設計。

`GameScene.pause()` は `scrollManager.stop()` を呼ぶが、`GameScene.resume()` は `scrollManager.setSpeed()` のみで `scrollManager.resume()` を呼んでいない。結果として `active` が `false` のまま残り、スクロールが再開されない。

## Goals / Non-Goals

**Goals:**

- `GameScene.resume()` で `scrollManager.resume()` を呼び出し、スクロールを正しく再開する

**Non-Goals:**

- `ScrollManager` の内部設計の変更
- ポーズ以外のスクロール制御ロジックの変更

## Decisions

### `scrollManager.resume()` の呼び出し位置

`GameScene.resume()` 内の `scrollManager.setSpeed()` の直前（または直後）に `scrollManager.resume()` を追加する。

呼び出し条件は既存の `if (this.state === "playing" || ...)` ブロックの外側に置き、**常に呼び出す**。これにより `stone_fall_coasting` など速度を変えないステートからの復帰でも確実にスクロールが再開される。

## Risks / Trade-offs

特になし。1行追加の局所的な修正であり、副作用のリスクは極めて低い。
