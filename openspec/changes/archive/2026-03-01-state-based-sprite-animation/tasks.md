# Tasks: state-based-sprite-animation

## 1. Player ジャンプ中アニメーション停止

- [x] 1.1 `Player.ts` の `releaseJump()` 内でジャンプ発動時に `this.anims.stop()` を呼び出してアニメーションを停止する
- [x] 1.2 `Player.ts` の `releaseJump()` 内でジャンプ発動時に `this.setScale(1, 1)` で `scaleY` を 1.0 にリセットする
- [x] 1.3 `Player.ts` の `onLanded()` が着地後に正しくアニメーションを再開していることを確認する（既存コードで対応済みのためスキップ）

## 2. Player ゴール接触後アニメーション停止

- [x] 2.1 `Player.ts` の `createAnimations()` 内で `player_goal` アニメーションの `repeat` を `-1` から `0` に変更し、1回再生後に最終フレームで停止するよう修正する

## 3. Enemy 接触後アニメーション停止

- [x] 3.1 `Enemy.ts` の `stopChasing()` メソッド内で `this.anims.stop()` を呼び出し、走行アニメーションを停止する
- [x] 3.2 `GameScene.ts` の `enemyReached` イベントハンドラ内で `player.anims.stop()` を呼び出し、プレーヤーのアニメーションも停止する

## 4. Player チャージ中 Y 方向スケール縮小

- [x] 4.1 `Player.ts` の `update()` メソッドにチャージ量取得ロジックを追加し、チャージ中は `scaleY = 1.0 - 0.3 * chargeAmount` を設定する
- [x] 4.2 チャージ非中（チャージなし）の場合は `this.setScale(1, 1)` で `scaleY` を 1.0 にリセットする処理を `update()` に追加する

## 5. テスト

- [x] 5.1 `Player.test.ts` にジャンプ中のアニメーション停止をカバーするテストケースを追加する（モックまたはスタブを使用）
- [x] 5.2 `Player.test.ts` にチャージ量に連動した `scaleY` 変化をカバーするテストケースを追加する
- [x] 5.3 `CollisionManager.test.ts` または統合テストで Enemy の `stopChasing()` 後のアニメーション停止を確認するテストケースを追加・更新する
