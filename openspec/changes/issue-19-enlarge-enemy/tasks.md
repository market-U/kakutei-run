# tasks: issue-19-enlarge-enemy

## 1. アセット定数の更新

- [x] 1.1 `src/assets/AssetKeys.ts` の `FrameSize.ENEMY` を `{ width: 96, height: 144 }` に変更する

## 2. プレースホルダー更新と再生成

- [x] 2.1 `scripts/generate-placeholders.mjs` の Enemy 行（`saveSpritesheet("enemy_run.png", 64, 96, 6, ...)`）のフレームサイズを `96, 144` に変更する
- [x] 2.2 `npm run generate-placeholders` を実行してプレースホルダースプライトシートを再生成する

## 3. 動作確認

- [x] 3.1 `npm run dev` でローカル起動し、敵キャラクターが以前より約1.5倍大きく表示されることを目視確認する
- [x] 3.2 Enemy の当たり判定（`getHitBounds`）が新スプライトサイズ（96×144）に基づく値を返すことを確認する（既存テストが通ること）
- [x] 3.3 `npm run test` を実行し、既存テストが全件通ることを確認する

## 4. 実アセット差し替え

- [x] 4.1 実素材の敵スプライトシート（全体幅 576px × 高さ 144px、6フレーム横並び）を `public/assets/sprites/enemy_run.png` に上書き配置する
- [x] 4.2 実素材に差し替えた状態でローカル起動し、表示・アニメーションに問題がないことを確認する
