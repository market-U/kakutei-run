# proposal: issue-68-fix-loop-leak

## Why

ゲーム終了後にシーン切り替え・リトライ・タブ非アクティブ化・リロードなどが発生した際、クリーンアップされないタイマー・イベントリスナー・オブジェクトがメモリ上に蓄積し、ゲームのクラッシュやパフォーマンス低下を引き起こす可能性がある。
リリース前に潜在的なループ残存ルートをすべて修正し、安定した動作を確保する。

## What Changes

- `GameScene` の SHUTDOWN イベントハンドラを追加し、`player` の `backPainActivated` リスナーを明示的に解除する
- `GameScene` 内の `this.time.delayedCall()` の返り値をすべてプロパティで保持し、SHUTDOWN 時に `remove()` する
- `CommentManager` の `stopSpawning()` / `setEnabled(false)` を SHUTDOWN 時にも呼び出し、ゲームオーバー後のループバーストが確実に停止されるようにする
- `EffectManager` に `destroy()` メソッドを追加し、シーン SHUTDOWN 時にアクティブなエフェクトを一括破棄する
- `Stone` のネストされた tween が途中でシーン切り替えになっても残存オブジェクトが生じないよう対処する

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `scenes`: GameScene に SHUTDOWN クリーンアップロジックを追加（タイマー・リスナーの破棄）
- `niconico-comments`: CommentManager のループバースト停止を SHUTDOWN 時にも保証
- `collision-effects`: EffectManager に destroy メソッドを追加し、シーン破棄時の残存オブジェクトを防止

## Impact

- `src/scenes/GameScene.ts`: SHUTDOWN ハンドラ追加、delayedCall の参照管理
- `src/systems/CommentManager.ts`: shutdown 時の stopSpawning / setEnabled 呼び出し保証
- `src/systems/EffectManager.ts`: destroy メソッドの追加
- `src/objects/Stone.ts`: tween 中断時の残存オブジェクト対処
