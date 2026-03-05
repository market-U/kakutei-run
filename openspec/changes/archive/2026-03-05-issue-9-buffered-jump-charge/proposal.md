# proposal: issue-9-buffered-jump-charge

## Why

ジャンプ中にジャンプ入力が発生した場合、現在は入力が完全に無視されるため、
着地直後のジャンプへの連続入力が実質不可能で、操作感が損なわれている。
着地タイミングに合わせた入力バッファリングを導入することで、より自然で快適な操作感を実現する。

## What Changes

- ジャンプ中（空中）にタッチダウンまたはスペースキーダウンが発生した場合、「着地時にチャージを開始する」バッファフラグを立てる
- 空中でリリース（タッチアップ / スペースキーアップ）が発生した場合、バッファフラグをキャンセルする
- 着地時にバッファフラグが立っていれば、着地した瞬間をチャージ開始時刻として記録し、その後の離す操作でジャンプを発動する
- チャージ量は「着地時刻から離すまでの時間」で決まる（空中で押していた時間は含まない）
- スペースキーとタッチの挙動を統一する

## Capabilities

### New Capabilities

なし（既存の `player-mechanics` 能力の拡張として扱う）

### Modified Capabilities

- `player-mechanics`: ジャンプ入力バッファリングの要件を追加する

## Impact

- `src/objects/PlayerStateManager.ts`: `pendingChargeOnLand` フラグ、`onPressInAir()`・`onReleaseInAir()`・`consumePendingCharge()` メソッドを追加
- `src/objects/Player.ts`: `startCharge()`・`releaseJump()`・`onLanded()` を更新し、バッファロジックを組み込む
- `src/objects/__tests__/PlayerStateManager.test.ts`（または既存のテストファイル）: バッファ関連の単体テストを追加
