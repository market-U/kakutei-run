# Tasks: issue-31-fix-scroll-stop-on-stone-hit

## 1. GameScene バグ修正（onStoneHit ガード拡張 + タイマー堅牢化）

- [x] 1.1 `GameScene` に `private backPainTimer: Phaser.Time.TimerEvent | null = null` フィールドを追加する
- [x] 1.2 `onBackPainStart` 内の `this.time.delayedCall(...)` の戻り値を `this.backPainTimer` に代入するよう修正する
- [x] 1.3 `onStoneHit` のガード条件を `state !== "playing" && state !== "back_pain_slow"` に拡張する
- [x] 1.4 `onStoneHit` のガード通過後に `this.backPainTimer?.remove(false)` でタイマーをキャンセルし `null` にリセットする

## 2. セーフネット実装（最大スクロール距離超過による強制終了）

- [x] 2.1 `GameScene.update()` の先頭ガード（`stone_fall` / `game_over` チェック）の直後に `scrolledX > this.difficulty.stageLength + 500` の超過チェックを追加する
- [x] 2.2 超過検出時に呼ぶ `private onScrollOverrun(): void` メソッドを実装する（`scrollManager.stop()` / `state = "game_over"` / 2 秒後に `ResultScene` へ遷移）

## 3. 動作確認・既存テスト

- [x] 3.1 `npm test` を実行し既存テストがすべてパスすることを確認する
- [x] 3.2 手動確認: 腰痛スロー状態中に石ころへ衝突し、`player_fall` アニメーション完了後にスクロールが停止することを確認する
- [x] 3.3 手動確認: 通常走行中・ジャンプ中の石ころ被弾が引き続き正常に動作することを確認する
