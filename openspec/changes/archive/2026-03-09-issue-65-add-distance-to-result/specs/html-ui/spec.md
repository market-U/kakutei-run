# Spec Delta: html-ui

## MODIFIED Requirements

### Requirement: HTML リザルト画面

リザルト画面は Phaser シーンではなく HTML 要素として実装しなければならない（SHALL）。Phaser の `ResultScene` は廃止する。

#### Scenario: リザルト画面の表示

- **WHEN** `kakutei:gameResult` イベントを受信する
- **THEN** HTML リザルト画面が表示される
- **AND** 結果（クリア / ゲームオーバー）・レシート取得率・走行距離・SNSシェアボタン・リトライボタンが HTML 要素として描画される
