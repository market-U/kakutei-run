# proposal: issue-7-witch-receipt-speed-factor

## Why

`Witch` および `Receipt` の `updateScroll` メソッドで速度係数が毎フレームリセットされており、`gameConfig` に定義した `witchScrollSpeedFactorMin/Max` および `receiptSpeedFactorMin/Max` の値が実際の移動に反映されていない。

## What Changes

- `Witch.ts`: `updateScroll` の移動量を累積フィールドで管理し、速度係数が時間経過とともに正しく蓄積されるよう修正
- `Receipt.ts`: 同上

## Capabilities

### New Capabilities

なし

### Modified Capabilities

なし（既存のスペック要件は変わらず、実装バグの修正のみ）

## Impact

- `src/objects/Witch.ts`
- `src/objects/Receipt.ts`
