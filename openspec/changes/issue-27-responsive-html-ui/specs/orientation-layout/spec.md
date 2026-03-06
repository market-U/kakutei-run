# Spec: orientation-layout

## ADDED Requirements

### Requirement: 縦横レイアウトの切り替え

ゲームは縦画面（ポートレート）と横画面（ランドスケープ）の両方でプレイできなければならない（SHALL）。OrientationManager が向きを管理し、`body` への CSS クラス付与と Phaser カメラのビューポート切り替えによってレイアウトを切り替える。

#### Scenario: 縦画面でのレイアウト

- **WHEN** 縦画面が有効である
- **THEN** `body` に `portrait` クラスが付与される
- **AND** Phaser カメラはキャンバス全体（960×1440）を表示する
- **AND** HUD オーバーレイはキャンバス上部に表示される

#### Scenario: 横画面でのレイアウト

- **WHEN** 横画面が有効である
- **THEN** `body` に `landscape` クラスが付与される
- **AND** Phaser カメラのビューポートがゲームゾーン（y=360〜900、高さ540px）のみに設定される
- **AND** カメラの `scrollY` が `GAME_ZONE_Y`（360）に設定される
- **AND** CSS によりキャンバスが横画面いっぱいに拡大表示される

### Requirement: 端末回転による自動切り替え

端末を物理的に回転させたとき、向きの変化を検知してレイアウトを自動的に切り替えなければならない（SHALL）。

#### Scenario: 端末を横向きに回転

- **WHEN** 端末が縦向きから横向きに回転する
- **THEN** `kakutei:orientationChanged` イベントが `{ orientation: 'landscape' }` で発火する
- **AND** レイアウトが横画面に切り替わる

#### Scenario: 端末を縦向きに回転

- **WHEN** 端末が横向きから縦向きに回転する
- **THEN** `kakutei:orientationChanged` イベントが `{ orientation: 'portrait' }` で発火する
- **AND** レイアウトが縦画面に切り替わる

#### Scenario: screen.orientation 非対応環境でのフォールバック

- **WHEN** `screen.orientation` API が未サポートの環境である
- **THEN** `window.orientationchange` イベントを代わりに使用して向きを検知する

### Requirement: 手動切り替えボタン

ゲーム内に縦横を手動で切り替えるボタンを設置しなければならない（SHALL）。端末の回転ロック設定に依存せずユーザーが切り替えられるようにする。

#### Scenario: ボタンによる横画面への切り替え

- **WHEN** ユーザーが縦画面時に切り替えボタンを押す
- **THEN** レイアウトが横画面に切り替わる

#### Scenario: ボタンによる縦画面への切り替え

- **WHEN** ユーザーが横画面時に切り替えボタンを押す
- **THEN** レイアウトが縦画面に切り替わる

#### Scenario: ボタンの常時表示

- **WHEN** ゲームが動作中である
- **THEN** 切り替えボタンはタイトル・ゲーム中・リザルトの全画面で表示される

### Requirement: ゲーム中のポーズ機能

ゲームプレイ中（GameScene がアクティブ）はいつでもポーズできなければならない（SHALL）。ポーズの解除はユーザーの明示的な操作によってのみ行われる（SHALL）。自動再開は行ってはならない（SHALL NOT）。

#### Scenario: ポーズボタンによるポーズ

- **WHEN** ゲームプレイ中にユーザーがポーズボタンを押す
- **THEN** ゲームスクロールが一時停止する
- **AND** ポーズオーバーレイが画面に表示される

#### Scenario: 向き変化によるポーズ

- **WHEN** GameScene がアクティブ中に `kakutei:orientationChanged` イベントが発火する
- **THEN** ゲームスクロールが一時停止する
- **AND** ポーズオーバーレイが画面に表示される

#### Scenario: ポーズ解除

- **WHEN** ポーズ中にユーザーがポーズオーバーレイをタップする
- **THEN** ゲームスクロールが再開する
- **AND** ポーズオーバーレイが非表示になる

#### Scenario: ポーズ中の向き変化でポーズ状態を維持する

- **WHEN** すでにポーズ中に `kakutei:orientationChanged` イベントが発火する
- **THEN** ポーズ状態は維持され、二重にポーズ処理が走ってはならない（SHALL NOT）
