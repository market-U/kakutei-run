# Tasks: fix-enemy-depth-and-collision

## 1. 描画順（depth）の変更

- [x] 1.1 `src/objects/Enemy.ts` の `setDepth(8)` を `setDepth(11)` に変更

## 2. Enemy の衝突判定を矩形オーバーラップに変更

- [x] 2.1 `src/objects/Enemy.ts` に `getHitBounds()` メソッドを追加（`displayWidth * 0.8` × `displayHeight * 0.8`）
- [x] 2.2 `src/systems/CollisionManager.ts` の `checkEnemyReached()` を `rectsOverlap()` ベースの矩形判定に変更
- [x] 2.3 `src/objects/Enemy.ts` の `hasReachedPlayer()` メソッドを削除

## 3. テストの確認・修正

- [x] 3.1 `npm test` で既存テストを実行し、Enemy 判定変更による失敗を確認・修正
- [x] 3.2 動作確認：敵キャラがプレーヤーより手前に表示されることを目視確認

## 4. 追加修正（動作確認で発見）

- [x] 4.1 Enemy 衝突後にその場で停止させる（`stopChasing()` 追加、`onEnemyReached` で呼び出し）
- [x] 4.2 Enemy 追跡中（`stone_fall` 状態）に Player のジャンプを無効化する
