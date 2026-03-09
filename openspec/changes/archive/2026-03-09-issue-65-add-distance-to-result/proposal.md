# Proposal: Result画面のシェア情報にdistanceを追加する

## Why

シェア用画像に走行距離（distance）が含まれておらず、プレイヤーの頑張りを可視化できていない。distance を Result 画面に渡してシェア画像・テキストに含めることで、プレイ内容のより豊かな共有が可能になる。

## What Changes

- `kakutei:gameResult` カスタムイベントの `detail` に `distance`（メートル単位の整数）を追加する
- `ResultUI` の `ResultDetail` インターフェースに `distance` フィールドを追加する
- `generateShareImage` に `distance` を渡し、シェア用 Canvas 画像に走行距離を描画する
- Result 画面の HTML UI にも走行距離を表示する（開発者にて実施）
- （UI レイアウトの具体的な配置はissueの指示通り開発者が手動調整する）

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `result-share-image`: シェア画像に走行距離を描画するよう要件を追加する
- `html-ui`: Result 画面に走行距離を表示するよう要件を追加する
- `scenes`: `kakutei:gameResult` イベントの payload に `distance` フィールドを追加する

## Impact

- `src/scenes/GameScene.ts`: 3 箇所の `kakutei:gameResult` 発火ポイントに `distance` を追加
- `src/ui/ResultUI.ts`: `ResultDetail` 型・`show` メソッド・`generateShareImage` メソッドの修正
- `index.html`: Result 画面の HTML に走行距離表示要素を追加（開発者にて実施）
- `openspec/specs/scenes/spec.md`: イベント payload の仕様を更新
- `openspec/specs/result-share-image/spec.md`: 画像内の描画要素として distance を追記
- `openspec/specs/html-ui/spec.md`: Result 画面の表示要素として distance を追記
