## Why

ジャンプチャージ中にY方向の縮小のみを行うと、プレーヤーがかなり小さく見えてしまい視覚的な違和感がある。X方向への拡大を同時に加えることで、チャージ中のスクワット感・力を溜めている感が向上する。

## What Changes

- ジャンプチャージ中、Y方向の縮小と連動してX方向に1.2倍まで拡大する
- 拡大の起点はスプライト中央（X軸は左右対称）
- X方向の当たり判定は変更しない（見た目のみ変更）
- チャージリリース（ジャンプ発動）時に `scaleX` を 1.0 にリセットする
- 他の状態遷移時の等倍リセット処理はすでに `setScale(1.0, 1.0)` を呼んでいるため追加対応不要

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `player-mechanics`: チャージ中のスプライトスケール仕様を変更。Y方向縮小に加え、X方向の拡大（最大 scaleX = 1.2）を追加する。

## Impact

- `src/objects/Player.ts` — チャージ更新ロジックで `scaleX` 計算を追加
- `openspec/specs/player-mechanics/spec.md` — チャージ中スケール要件にX方向拡大を追記
