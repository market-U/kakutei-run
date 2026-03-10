# Spec: niconico-comments (delta)

## ADDED Requirements

### Requirement: CommentManager のシーン SHUTDOWN 時の停止

`CommentManager` は `shutdown()` メソッドを持たなければならない（SHALL）。
`shutdown()` 呼び出し時は以下をすべて実行しなければならない（SHALL）。

- `stopSpawning()` を呼び、新規コメントのスポーンを停止する
- `burstLoopType` を `null` にリセットし、ループバーストを停止する
- `burstQueue` をクリアする
- 画面上のすべてのコメントテキストオブジェクトを `destroy()` する

#### Scenario: シーン SHUTDOWN 時にループバーストが停止する

- **WHEN** GameScene の `SHUTDOWN` イベントが発火する
- **THEN** `CommentManager.shutdown()` が呼ばれる
- **AND** ループバースト（ゴール時・ゲームオーバー時）が即座に停止する
- **AND** 以降のフレームで新しいコメントがスポーンされない

#### Scenario: リトライ時に旧コメントが残存しない

- **WHEN** ゲームオーバー後にリトライする
- **THEN** 前のゲームセッションのコメントテキストオブジェクトはすべて破棄済みである
