# Proposal: WitchとReceiptの共通処理をScrollableSpriteに統合

## Why

`Witch` と `Receipt` は、ワールド座標・速度係数・スクロール連動ロジック（`updateScroll`）などまったく同じフィールドとメソッドを重複して保持している。
この重複をなくすことで保守性を高め、将来レシートにアニメーションを追加する際の改修コストをゼロに近づける。

## What Changes

- **新規** `src/objects/ScrollableSprite.ts` を作成する（abstract class）
  - 共通フィールド: `worldX`, `worldY`, `speedFactor`, `extraScrolledX`, `_hasFramedIn`
  - 共通メソッド: `updateScroll(scrolledX, scrollSpeed, delta)`
  - 抽象メソッド: `isVisible()`, `getHitBounds()`
- `Witch` を `Phaser.GameObjects.Sprite` の直接継承から `ScrollableSprite` 継承に変更し、重複部分を削除する
- `Receipt` を `Phaser.GameObjects.Image` から `ScrollableSprite`（Sprite ベース）に変更し、重複部分を削除する
  - 将来のアニメーション追加に備え、1フレームのスプライトシートとして扱う
- レシートアセットを3種（`receipt_1` / `receipt_2` / `receipt_3`）から1種（`receipt`）に統合する
  - 現在3種はすべて同一画像のため、視覚的な変化なし
- `AssetKeys.ts` の `RECEIPT_1/2/3` を `RECEIPT` 1つにまとめ、`FrameSize.RECEIPT` / `FrameCount.RECEIPT` を追加する
- `BootScene.ts` のアセットロードを `load.image × 3` から `load.spritesheet × 1` に更新する
- 不要になった画像ファイル `receipt_2.png` / `receipt_3.png` を削除し、`receipt_1.png` を `receipt.png` にリネームする

## Capabilities

### New Capabilities

- なし（本変更は内部リファクタリングであり、ユーザー向けの新機能は追加しない）

### Modified Capabilities

- `assets`: レシートアセットのバリアント数が「1〜3種類」から「1種類」に変更される

## Impact

- `src/objects/Witch.ts`: ScrollableSprite 継承に変更、重複フィールド・メソッド削除
- `src/objects/Receipt.ts`: ScrollableSprite 継承・Image→Sprite 変更、重複フィールド・メソッド削除、3種ランダム選択ロジック削除
- `src/objects/ScrollableSprite.ts`: 新規作成
- `src/assets/AssetKeys.ts`: RECEIPT_1/2/3 → RECEIPT 統合、FrameSize/FrameCount 追加
- `src/scenes/BootScene.ts`: アセットロード方式変更
- `public/assets/sprites/`: `receipt_1.png` → `receipt.png` リネーム、`receipt_2.png` / `receipt_3.png` 削除
- 外部 API・ゲームの挙動・ユーザー体験への影響なし
