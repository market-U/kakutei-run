# Spec: orientation-layout

## ADDED Requirements

### Requirement: 向きに応じた CSS クラス付与

OrientationManager が向きを管理し、`body` への CSS クラス付与によりレイアウトを制御する。Phaser キャンバスは常に 960×540 で Scale.FIT がスケーリングするため、カメラビューポートの切り替えは不要である。スマホ横画面への特別な対応は行わない。

#### Scenario: 縦画面での CSS クラス付与

- **WHEN** 縦画面が有効である
- **THEN** `body` に `portrait` クラスが付与される

#### Scenario: 横画面での CSS クラス付与

- **WHEN** 横画面が有効である
- **THEN** `body` に `landscape` クラスが付与される

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
