# Tasks: ScrollableSprite リファクタリング

## 1. アセット整理

- [x] 1.1 `public/assets/sprites/receipt_1.png` を `receipt.png` にリネームする
- [x] 1.2 `public/assets/sprites/receipt_2.png` と `receipt_3.png` を削除する

## 2. AssetKeys・定数更新

- [x] 2.1 `AssetKeys.ts` の `RECEIPT_1` / `RECEIPT_2` / `RECEIPT_3` を削除し、`RECEIPT: "receipt"` を Spritesheets セクションに追加する
- [x] 2.2 `FrameSize.RECEIPT: { width: 32, height: 48 }` を追加する
- [x] 2.3 `FrameCount.RECEIPT: 1` を追加する

## 3. BootScene 更新

- [x] 3.1 `loadStaticImages()` から `RECEIPT_1` / `RECEIPT_2` / `RECEIPT_3` の `load.image` 呼び出し3件を削除する
- [x] 3.2 `loadSpritesheets()` に `RECEIPT` の `load.spritesheet` 呼び出しを追加する（frameWidth: 32, frameHeight: 48, endFrame: 0）

## 4. ScrollableSprite 抽象クラス作成

- [x] 4.1 `src/objects/ScrollableSprite.ts` を新規作成し、`abstract class ScrollableSprite extends Phaser.GameObjects.Sprite` を定義する
- [x] 4.2 共通フィールド（`worldX`, `worldY`, `speedFactor`, `extraScrolledX`, `_hasFramedIn`）とコンストラクタを実装する
- [x] 4.3 `updateScroll(scrolledX, scrollSpeed, delta)` の共通ロジックを実装する
- [x] 4.4 `abstract isVisible(): boolean` と `abstract getHitBounds(): Phaser.Geom.Rectangle` を宣言する

## 5. Witch リファクタリング

- [x] 5.1 `Witch` の継承元を `Phaser.GameObjects.Sprite` から `ScrollableSprite` に変更する
- [x] 5.2 `ScrollableSprite` に移動した重複フィールド（`worldX`, `worldY`, `speedFactor`, `extraScrolledX`, `_hasFramedIn`）を `Witch` から削除する
- [x] 5.3 `Witch` の `updateScroll()` を削除し、コンストラクタの速度係数初期化を `super()` 呼び出しに移行する

## 6. Receipt リファクタリング

- [x] 6.1 `Receipt` の継承元を `Phaser.GameObjects.Image` から `ScrollableSprite` に変更する
- [x] 6.2 `RECEIPT_KEYS` 配列とランダム選択ロジックを削除し、`AssetKeys.RECEIPT` を直接使用するように変更する
- [x] 6.3 `ScrollableSprite` に移動した重複フィールドを `Receipt` から削除する
- [x] 6.4 `Receipt` の `updateScroll()` を削除し、コンストラクタの速度係数初期化を `super()` 呼び出しに移行する

## 7. 動作確認

- [x] 7.1 `npm run build`（または `vite build`）でビルドエラーがないことを確認する
- [x] 7.2 ブラウザでゲームを起動し、レシートと魔女が正常にスクロール・表示されることを確認する
- [x] 7.3 魔女に接触したときのペナルティ、レシート収集が正常に動作することを確認する
