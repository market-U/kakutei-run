# tasks: issue-9-buffered-jump-charge

## 1. PlayerStateManager への追加

- [x] 1.1 `_pendingChargeOnLand` フィールドと `pendingChargeOnLand` ゲッターを追加する
- [x] 1.2 `onPressInAir()` メソッドを追加する（空中かつゲーム中の場合にバッファフラグを立てる）
- [x] 1.3 `onReleaseInAir()` メソッドを追加する（バッファフラグをキャンセルする）
- [x] 1.4 `consumePendingCharge()` メソッドを追加する（フラグを読んで即 false にリセットし、元の値を返す）
- [x] 1.5 `triggerFall()`・`triggerGoal()`・`triggerEnemyCaught()` にバッファフラグのクリアを追加する

## 2. PlayerStateManager の単体テスト追加

- [x] 2.1 空中プレス → 着地 → `consumePendingCharge()` が `true` を返すシナリオを追加する
- [x] 2.2 空中プレス → 空中リリース → 着地 → `consumePendingCharge()` が `false` を返すシナリオを追加する
- [x] 2.3 空中プレス → `triggerFall()` → `consumePendingCharge()` が `false` を返すシナリオを追加する
- [x] 2.4 地上でのプレスには `onPressInAir()` がバッファを立てないことを検証するシナリオを追加する

## 3. Player.ts の更新

- [x] 3.1 `startCharge()` を更新する：`!ps.grounded` の場合に `ps.onPressInAir()` を呼ぶ（即リターンしていた箇所）
- [x] 3.2 `releaseJump()` を更新する：`chargeStartTime === null` かつ空中の場合に `ps.onReleaseInAir()` を呼ぶ
- [x] 3.3 `onLanded()` を更新する：`ps.consumePendingCharge()` を呼び、`true` かつ `!jumpDisabled` なら `chargeStartTime = scene.time.now` を設定する
