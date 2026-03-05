# Tasks: issue-26-delay-scroll-stop-on-fall

## 1. CollisionManager の変更

- [x] 1.1 `CollisionManager.checkStones()` から `enemy.startChasing()` の呼び出しを削除する

## 2. GameScene の状態管理変更

- [x] 2.1 `GameState` 型に `"stone_fall_coasting"` を追加する
- [x] 2.2 `onStoneHit()` から `scrollManager.stop()` を削除し、`state = "stone_fall_coasting"` に変更する
- [x] 2.3 `onStoneHit()` に `animationcomplete-player_fall` の `once` リスナーを追加し、完了時に `scrollManager.stop()` → `enemy.startChasing()` → `state = "stone_fall"` を実行する

## 3. update() ループの分岐追加

- [x] 3.1 `update()` の early return 条件から `"stone_fall_coasting"` を外し、その状態専用の処理ブロックを追加する（スクロール継続・ワールドオブジェクト更新・`checkEnemyReached` のみ実行）

## 4. 動作確認

- [ ] 4.1 石ころに躓いた後、`player_fall` アニメーション再生中に背景がスクロールし続けることを目視確認する
- [ ] 4.2 `player_fall` アニメーション完了後にスクロールが停止し、敵が近づいてくることを目視確認する
- [x] 4.3 既存のユニットテスト（`npm run test`）がすべてパスすることを確認する
