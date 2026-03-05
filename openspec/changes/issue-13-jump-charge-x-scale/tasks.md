## 1. ユーティリティ関数の追加

- [ ] 1.1 `src/systems/gameUtils.ts` に `calcChargeScaleX(chargeAmount: number): number` 関数を追加する（`1.0 + 0.2 * chargeAmount` を返す）
- [ ] 1.2 `src/systems/__tests__/gameUtils.test.ts` に `calcChargeScaleX` のテストを追加する（チャージ0で1.0、チャージ1で1.2、中間値を確認）

## 2. Player スプライトスケール更新

- [ ] 2.1 `src/objects/Player.ts` の `import` に `calcChargeScaleX` を追加する
- [ ] 2.2 チャージ更新処理（`this.setScale(1, calcChargeScale(chargeAmount))`）を `this.setScale(calcChargeScaleX(chargeAmount), calcChargeScale(chargeAmount))` に変更する

## 3. spec 反映

- [ ] 3.1 `openspec/specs/player-mechanics/spec.md` の「チャージ中の Y 方向スケール縮小」要件にX方向拡大シナリオを追記する（delta spec の内容をマージ）
