# Design: Result画面のシェア情報にdistanceを追加する

## Context

現在 `kakutei:gameResult` イベントの payload には `result / collected / total / difficultyId / shareComment` が含まれているが、`distance`（走行距離）は含まれていない。走行距離は `GameScene.ts` の `scrolledX`（ピクセル）を `/ 10` してメートルに変換した値として HUD に表示されており、情報自体はゲーム内に存在する。

Result 画面では走行距離を（1）HTML UI に表示し、（2）シェア用 Canvas 画像に描画することが求められている。

## Goals / Non-Goals

**Goals:**

- `kakutei:gameResult` の payload に `distance`（m単位の整数）を追加する
- `ResultUI` がその値を受け取り、シェア用 Canvas 画像に描画できるようにする
- Result 画面 HTML への走行距離表示を実装するための土台（型・データフロー）を整える

**Non-Goals:**

- Result 画面 HTML の具体的なレイアウト・スタイル調整（開発者が手動実施）
- Canvas 画像内の走行距離の配置・フォント調整（開発者が手動実施）
- シェアテキストへの走行距離追記（今回スコープ外）

## Decisions

### distance の単位・算出方法はGameScene側で確定させる

`scrolledX / 10` のメートル換算ロジックはすでに `GameScene.ts` で使われており（`hud.setDistance(Math.floor(this.scrolledX / 10))`）、同じ計算式で `distance` を payload に含める。`ResultUI` 側では単位換算を行わず、受け取った値をそのまま `${distance}m` として利用する。

代替案として ResultUI 側で px を受け取って変換する方法も考えられるが、換算ロジックの重複を避けるため GameScene 側で完結させる。

### ResultDetail インターフェースに distance を追加する

`ResultUI.ts` の `ResultDetail` インターフェースを拡張して `distance: number` を追加する。既存の `show` メソッドはデストラクチャリングで受け取っているため、`distance` を追加するだけで画像生成メソッドへの受け渡しまで自然に拡張できる。

## Risks / Trade-offs

- `kakutei:gameResult` の payload 変更は後方互換性を壊すが、このイベントはゲーム内部でのみ使用されており外部 API ではないため問題ない
- Canvas 画像内のレイアウトは開発者が手動調整するため、タスクではコード上の受け渡しのみを実装対象とする

## Open Questions

なし
