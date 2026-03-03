# Tasks: fix-player-animation-state

## 1. Player クラスのフラグ整理

- [ ] 1.1 `Player` クラスに `private falling = false` フィールドを追加する
- [ ] 1.2 `triggerFall()` を修正し、`gameOver=true` のセットを削除して `falling=true` をセットするよう変更する
- [ ] 1.3 `triggerFall()` に `setScale(1, 1)` によるスプライト等倍リセットを追加する

## 2. アニメーション定義の変更

- [ ] 2.1 `createAnimations()` 内の `player_goal` アニメーション定義を `repeat: 0` から `repeat: -1`（ループ）に変更する

## 3. `playAnim()` の修正

- [ ] 3.1 `playAnim()` の再生スキップ条件を `currentAnim?.key !== key` から `currentAnim?.key !== key || !anims.isPlaying` に変更する

## 4. `onLanded()` の修正

- [ ] 4.1 `onLanded()` の先頭に `if (this.falling || this.gameOver) return` ガードを追加する

## 5. `activateBackPain()` の空中被弾対応

- [ ] 5.1 `activateBackPain()` を修正し、`!this.grounded`（空中）の場合は `player_back_pain` の frame 0 を表示してアニメーションを停止するよう変更する
- [ ] 5.2 `activateBackPain()` の腰痛タイマー満了コールバック内で、`this.grounded` かつ `!this.gameOver` かつ `!this.falling` のときのみ `player_run` を再生するよう修正する

## 6. `triggerGoal()` の修正

- [ ] 6.1 `triggerGoal()` に `setScale(1, 1)` によるスプライト等倍リセットを追加する

## 7. `triggerEnemyCaught()` の新設

- [ ] 7.1 `Player` クラスに `triggerEnemyCaught()` メソッドを新設する
- [ ] 7.2 `triggerEnemyCaught()` 内で `gameOver=true` をセットする
- [ ] 7.3 `triggerEnemyCaught()` 内で `falling=false` の場合のみ `setScale(1, 1)` して `player_goal` をループ再生する（`falling=true` の場合は sprite を変更しない）

## 8. GameScene の修正

- [ ] 8.1 `GameScene.onEnemyReached()` 内の `this.player.anims.stop()` 直接呼び出しを削除し、`this.player.triggerEnemyCaught()` の呼び出しに置き換える

## 9. テスト更新・確認

- [ ] 9.1 `Player.test.ts` を確認し、`triggerFall()` 後に `gameOver=false` かつ `falling=true` であることをテストするよう更新する
- [ ] 9.2 `Player.test.ts` に `onLanded()` が `falling=true` 時に無視されることのテストを追加する
- [ ] 9.3 `Player.test.ts` に `onLanded()` が `gameOver=true` 時に無視されることのテストを追加する（S6/S7 からの着地ガード）
- [ ] 9.4 `Player.test.ts` に `playAnim()` が停止後の同一キーアニメーションを再起動することのテストを追加する（S3→S1 の着地後 player_run 再起動）
- [ ] 9.5 `Player.test.ts` に `onLanded()` が `isBackPain=true` のとき `player_back_pain` を再起動することのテストを追加する（S4→S2）
- [ ] 9.6 `Player.test.ts` に `activateBackPain()` が空中（`grounded=false`）で呼ばれたとき `player_back_pain` の frame 0 で停止することのテストを追加する（S3→S4）
- [ ] 9.7 `Player.test.ts` に腰痛タイマー満了が空中（`grounded=false`）で発火したとき `isBackPain=false` になりスプライトが変化しないことのテストを追加する（S4→S3）
- [ ] 9.8 `Player.test.ts` に `triggerEnemyCaught()` が `falling=false` のとき `gameOver=true` かつ `player_goal` ループ再生になることのテストを追加する（S1/S2/S3/S4→S7）
- [ ] 9.9 `Player.test.ts` に `triggerEnemyCaught()` が `falling=true` のとき `gameOver=true` になるがスプライトが変化しないことのテストを追加する（S5→S7）
- [ ] 9.10 `Player.test.ts` に `triggerFall()` / `triggerGoal()` / `triggerEnemyCaught()` 呼び出し時に `setScale(1, 1)` が実行されることのテストを追加する（scaleリセット確認）
- [ ] 9.11 既存テストが全てパスすることを確認する（`npm test` 実行）

## 10. 動作確認

- [ ] 10.1 通常ジャンプ → 着地後に `player_run` が再開されることを確認する
- [ ] 10.2 腰痛中ジャンプ → 着地後に `player_back_pain` が再開されることを確認する
- [ ] 10.3 ジャンプ中に石の上に着地 → `player_fall` が再生され `player_run` に上書きされないことを確認する
- [ ] 10.4 ゴール到達後に `player_goal` がループ再生されることを確認する
- [ ] 10.5 敵到達ゲームオーバー（S1/S2/S3/S4 経由）で `player_goal` がループ再生されることを確認する
- [ ] 10.6 石ころ転倒後に敵到達（S5→S7）で `player_fall` 最終フレームが維持されることを確認する
