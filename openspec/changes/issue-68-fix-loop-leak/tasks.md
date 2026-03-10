# tasks: issue-68-fix-loop-leak

## 1. EffectManager に destroy メソッドを追加

- [x] 1.1 `EffectManager` に `destroy()` メソッドを追加し、`activeEffects` の全テキストオブジェクトを破棄して配列をクリアする

## 2. CommentManager に shutdown メソッドを追加

- [x] 2.1 `CommentManager` に `shutdown()` メソッドを追加し、`stopSpawning()` の呼び出し・`burstLoopType` のリセット・`burstQueue` のクリア・画面上の全コメントテキスト破棄を行う

## 3. GameScene の delayedCall を参照管理する

- [x] 3.1 GameScene の `delayedCall` 返り値（腰痛スロータイマー、リザルト遷移タイマー、コメント停止タイマーなど）をすべてインスタンスプロパティで保持するよう変更する

## 4. GameScene に SHUTDOWN ハンドラを追加する

- [x] 4.1 GameScene の `create()` 内で `this.events.on('shutdown', this.onShutdown, this)` を登録する
- [x] 4.2 `onShutdown()` メソッドを実装し、以下を順に実行する: `this.player.off("backPainActivated")` → 全 TimerEvent の `remove(false)` → `this.commentManager.shutdown()` → `this.effectManager.destroy()`

## 5. Stone の tween 残存問題を対処する

- [x] 5.1 `Stone` のネストした tween を、Phaser の `chain` または `this.scene.tweens.chain()` を使いフラットに書き直し、シーン切り替え時に tween が自動的にクリーンアップされる構造にする

## 6. 動作確認

- [ ] 6.1 ゲームプレイ → ゲームオーバー → リトライを 5 回繰り返し、コメントの二重流れ・エフェクト残存・タイマー誤発火がないことを確認する
- [ ] 6.2 ゴール到達 → タイトルへ戻る → 再スタート のルートで同様に確認する
- [ ] 6.3 ゲームプレイ中にタブをバックグラウンドに移してから戻り、ゲームが正常に動作することを確認する
