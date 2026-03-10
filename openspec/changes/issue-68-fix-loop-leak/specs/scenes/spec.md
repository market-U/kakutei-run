# Spec: scenes (delta)

## ADDED Requirements

### Requirement: GameScene の SHUTDOWN クリーンアップ

GameScene は Phaser の `SHUTDOWN` イベント（シーン停止・再起動・切り替え時に発火）のハンドラを持たなければならない（SHALL）。
ハンドラ内では以下をすべて実行しなければならない（SHALL）。

- `this.player.off("backPainActivated")` を呼び、イベントリスナーを解除する
- 保持しているすべての `Phaser.Time.TimerEvent` に対して `remove(false)` を呼び、タイマーを取り消す
- `commentManager.shutdown()` を呼び、ループバースト・コメントテキストを停止する
- `effectManager.destroy()` を呼び、アクティブなエフェクトオブジェクトを破棄する

#### Scenario: リトライ時にリスナーが重複登録されない

- **WHEN** ゲームオーバー後にリトライして GameScene が再起動する
- **THEN** `backPainActivated` リスナーは 1 つだけ登録された状態になる
- **AND** 前のセッションで登録されたリスナーは SHUTDOWN 時に解除済みである

#### Scenario: リトライ時にタイマーが引き継がれない

- **WHEN** ゲームオーバー後にリトライして GameScene が再起動する
- **THEN** 前のセッションで登録された `delayedCall` タイマーは SHUTDOWN 時にすべてキャンセル済みである
- **AND** 新しいゲームセッションに旧タイマーのコールバックが発火しない
