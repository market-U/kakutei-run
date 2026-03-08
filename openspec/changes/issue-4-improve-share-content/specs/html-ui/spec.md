# Spec: html-ui（delta）

## MODIFIED Requirements

### Requirement: HTML リザルト画面

リザルト画面は Phaser シーンではなく HTML 要素として実装しなければならない（SHALL）。Phaser の `ResultScene` は廃止する。

#### Scenario: リザルト画面の表示

- **WHEN** `kakutei:gameResult` イベントを受信する
- **THEN** HTML リザルト画面が表示される
- **AND** 結果（クリア / ゲームオーバー）・レシート取得率・SNSシェアボタン・リトライボタンが HTML 要素として描画される

#### Scenario: SNS シェア（画像あり）

- **WHEN** ユーザーがシェアボタンを押す
- **AND** `navigator.canShare({ files: [...] })` が `true` を返す
- **THEN** Canvas API で生成した 1080×1080px の画像ファイルと本文テキスト（URL + `#確定RUN`）を `navigator.share()` に渡して共有する

#### Scenario: SNS シェア（画像非対応環境のフォールバック）

- **WHEN** ユーザーがシェアボタンを押す
- **AND** `navigator.canShare({ files: [...] })` が `false` を返すまたは `navigator.share` が存在しない
- **THEN** テキストのみの Twitter intent URL を新規タブで開く
- **AND** テキストには難易度フレーズ・レシート取得率・バージョン・URL・`#確定RUN` を含める

#### Scenario: シェアテキストのフレーズ（クリア時）

- **WHEN** クリア結果でシェアが実行される
- **THEN** テキストの先頭フレーズは `<難易度名> 確定成功！` となる

#### Scenario: シェアテキストのフレーズ（ゲームオーバー時）

- **WHEN** ゲームオーバー結果でシェアが実行される
- **THEN** テキストの先頭フレーズは `<難易度名> 確定ならず…` となる

#### Scenario: リトライ

- **WHEN** ユーザーがリトライの難易度ボタンを押す
- **THEN** `kakutei:retryGame` イベントが `{ difficultyId }` とともに発火する
- **AND** HTML リザルト画面が非表示になる
- **AND** Phaser の GameScene が指定難易度で再起動する
