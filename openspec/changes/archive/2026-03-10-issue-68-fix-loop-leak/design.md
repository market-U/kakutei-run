# design: issue-68-fix-loop-leak

## Context

Phaser 3 では `scene.start()` でシーンを再起動すると `create()` が再実行される前に `SHUTDOWN` イベントが発火する。
しかし現状の GameScene は `SHUTDOWN` ハンドラを持たず、次のリソースがシーン間で残存する可能性がある。

- `this.time.delayedCall()` 返り値（TimerEvent）が保持されておらず、シーン再起動後もキューに残る
- `this.player.on("backPainActivated", ...)` が毎回 `create()` で重複登録される
- `CommentManager` の `burstLoopType` が停止されずに次フレームの `update()` でバーストが継続する
- `EffectManager` のアクティブな tween オブジェクトがシーン切り替えで `destroy()` されない
- `Stone` のネストした tween がシーン切り替えで中断されると内側の tween が登録されず、`destroy()` が呼ばれない

## Goals / Non-Goals

**Goals:**

- GameScene に `SHUTDOWN` ハンドラを追加し、タイマー・リスナーを確実に解除する
- `this.time.delayedCall()` の返り値をすべてプロパティで参照管理し、`SHUTDOWN` 時に `remove()` する
- `CommentManager.shutdown()` メソッドを追加し、ループバーストと全コメントを即座に停止する
- `EffectManager.destroy()` メソッドを追加し、アクティブエフェクトを一括破棄する
- `Stone` の tween を `onComplete` ネスト方式からフラットな方式（`chain` または単一 tween）へ変更する

**Non-Goals:**

- `OrientationManager` のグローバルリスナー（main.ts で1回だけ登録されており問題なし）
- `DifficultyButtons` の DOM リスナー（DOM 要素が GC されれば自動的に解放される）
- `ResultUI` の Promise/Canvas（ゲームセッション内で完結する）
- `CommentManager` の fetch タイムアウト処理（既に正しく実装されている）

## Decisions

### 決定1: Phaser の `this.events.on('shutdown', ...)` パターンを使用する

**理由**: Phaser のシーン再起動・停止・切り替えすべてで発火する。`destroy` イベントと異なり `scene.start()` でも確実に発火するため、リトライシナリオで機能する。

**却下した代替案**: `destroy` イベントのみ使う → `scene.start()` では `destroy` が発火しない場合があり不十分。

### 決定2: `delayedCall` 参照をインスタンスプロパティで管理する

**理由**: ゲームオーバー・スクロール超過・ゴール到達のいずれのルートでも同じ `shutdown` クリーンアップコードが機能する。

**実装**: `private backPainTimerEvent: Phaser.Time.TimerEvent | null = null` のように型付きプロパティで保持し、`SHUTDOWN` 時に `timerEvent?.remove(false)` を呼ぶ。

### 決定3: `CommentManager` に `shutdown()` メソッドを追加する

**理由**: `stopSpawning()` と `setEnabled(false)` を組み合わせるのではなく、`shutdown()` 1 回の呼び出しですべてのループバーストとコメントテキストを停止・破棄する責務をクラス側に持たせる。

### 決定4: `Stone` の tween を `complete` 後の単一 tween + yoyo から、2段階 tween に変更する

**理由**: Phaser のシーン `SHUTDOWN` 時は `this.tweens.killAll()` または `scene.sys.tweens.destroy()` が自動で呼ばれるため、tween の `onComplete` に依存した `destroy()` は中断時に実行されない。`Stone` 自体を `SHUTDOWN` 時に破棄するか、または `this.scene.tweens` がシーン破棄と連動している前提で実装を変えることで解決する。

## Risks / Trade-offs

- `TimerEvent.remove(false)` の第2引数 `dispatchCallback` を `false` にすることで、クリーンアップ中にコールバックが発火しない。これが意図した挙動であることを確認すること → 問題なし（SHUTDOWN 時はコールバック実行不要）
- `CommentManager.shutdown()` でコメントテキストを一括破棄するのはリトライボタン押下後（GameScene 再起動時）であり、リザルト画面表示後 5 秒間のコメント演出はその間にリトライボタンを押さない限り正常に流れ切る → 仕様上問題なし

## Migration Plan

実装後の確認手順:

1. ゲームプレイ → ゲームオーバー → リトライを 5 回繰り返し、メモリ増加・コメント二重流れ・エフェクト残存がないことを確認する
2. ゲームプレイ中にタブをバックグラウンドに移してから戻り、ゲームが正常に動作することを確認する
3. ページリロード後にゲームが正常に起動することを確認する
4. ゴール到達 → タイトルへ戻る → 再スタート のルートで同様に確認する
