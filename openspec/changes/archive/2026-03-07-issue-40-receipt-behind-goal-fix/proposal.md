# proposal: issue-40-receipt-behind-goal-fix

## Why

ゲーム開始直後から速度係数によるドリフトが累積するため、ステージ後半のレシートや魔女がゴールの裏に隠れてしまい取得・回避できない問題がある。
また、レシートの配置可能範囲がゴール直前まで許容されており、生成位置そのものもゴール周辺と重なりやすい。

## What Changes

- `Receipt` と `Witch` のドリフト累積を、ゲーム開始時ではなく画面フレームイン時から開始するよう変更する
- `MapGenerator` のオブジェクト配置上限（`maxX`）を `stageLength - 200` から `stageLength - 600` に拡大し、ゴールとの距離を確保する

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `game-world`: オブジェクト配置範囲のルール変更（maxX をゴールから 600px 以上離す）
- `receipt-scoring`: レシートのドリフト開始タイミングの変更（フレームイン時から）

## Impact

- `src/objects/Receipt.ts`: `_hasFramedIn` フラグの追加と `updateScroll` ロジック変更
- `src/objects/Witch.ts`: 同上
- `src/systems/MapGenerator.ts`: `maxX` の定数変更
- `src/systems/__tests__/MapGenerator.test.ts`: 配置範囲のテスト更新
