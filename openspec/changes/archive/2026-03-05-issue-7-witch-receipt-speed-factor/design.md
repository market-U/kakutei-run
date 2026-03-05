# design: issue-7-witch-receipt-speed-factor

## Context

`Witch` と `Receipt` はコンストラクタでランダムな速度係数（`speedFactor`）を生成するが、
`updateScroll` 内でその係数を1フレーム分にしか適用していない。

現状のコード:

```typescript
// 毎フレームリセットされるため累積しない
const extraDx = scrollSpeed * (speedFactor - 1.0) * delta / 1000;
this.x = worldX - scrolledX - extraDx;
```

## Goals / Non-Goals

**Goals:**

- `speedFactor` による移動差分をフレームをまたいで累積させ、時間経過とともに正しくずれが広がるようにする

**Non-Goals:**

- 設定値（`witchScrollSpeedFactorMin/Max` 等）の変更（動作確認後にユーザーが調整）

## Decisions

`extraScrolledX: number = 0` という累積フィールドをクラスに追加し、毎フレームの差分を積算する。

```typescript
// After
this.extraScrolledX += scrollSpeed * (this.speedFactor - 1.0) * delta / 1000;
this.x = this.worldX - scrolledX - this.extraScrolledX;
```

`Witch` と `Receipt` はそれぞれ独立したクラスだが、同一のパターンで修正する。

## Risks / Trade-offs

- リスクなし。既存の `worldX` / `scrolledX` 座標系と整合しており、追加フィールドの影響範囲はクラス内のみ。
