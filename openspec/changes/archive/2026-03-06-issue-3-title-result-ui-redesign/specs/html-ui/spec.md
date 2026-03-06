# Spec: html-ui (delta)

## MODIFIED Requirements

### Requirement: HTML タイトル画面

タイトル画面は Phaser シーンではなく HTML 要素として実装しなければならない（SHALL）。Phaser の `TitleScene` は廃止する。

#### Scenario: タイトル画面の表示

- **WHEN** `kakutei:assetsLoaded` イベントを受信する
- **THEN** HTML タイトル画面が表示される
- **AND** タイトルロゴ画像・難易度選択ボタン・操作説明・アプリバージョンが HTML 要素として描画される

#### Scenario: 難易度ボタン1タップでゲーム開始

- **WHEN** ユーザーが難易度ボタンをタップする
- **THEN** `kakutei:startGame` イベントが `{ difficultyId }` とともに発火する
- **AND** HTML タイトル画面が非表示になる
- **AND** Phaser の GameScene が起動する

#### Scenario: 縦画面レイアウト

- **WHEN** タイトル画面が縦画面（portrait）で表示される
- **THEN** ロゴ・難易度ボタン・操作説明・バージョンが縦に並んで表示される
- **AND** 内容が画面の高さを超える場合はスクロール可能である

#### Scenario: 横画面レイアウト

- **WHEN** タイトル画面が横画面（landscape）で表示される
- **THEN** 左カラムにロゴ画像・タイトル文字、右カラムに難易度ボタン・操作説明・バージョンが表示される
- **AND** 要素が画面外にはみ出さない

## REMOVED Requirements

### Requirement: スタートボタンによるゲーム開始

**Reason**: 難易度選択と開始を1タップに統合し、UX を改善するため廃止する。
**Migration**: 難易度ボタンのタップが直接 `kakutei:startGame` イベントを発火する。

## ADDED Requirements

### Requirement: タイトルロゴ画像の表示

タイトル画面にはロゴ画像要素を配置しなければならない（SHALL）。正式アセットが未準備の場合はプレースホルダー画像を使用し、差し替えは画像ファイルの置き換えのみで完結しなければならない（SHALL）。

#### Scenario: プレースホルダー画像の表示

- **WHEN** タイトル画面が表示される
- **THEN** `public/assets/ui/title_logo.png` がロゴ画像として表示される

#### Scenario: 正式アセットへの差し替え

- **WHEN** 正式なロゴ画像を配置する
- **THEN** `public/assets/ui/title_logo.png` を同名の PNG で上書きするだけでコード変更なく反映される

### Requirement: アプリバージョン表記

タイトル画面にはアプリバージョンを表示しなければならない（SHALL）。バージョン値は `package.json` の `version` フィールドから Vite の `define` 機能で埋め込まれる。

#### Scenario: バージョン表示

- **WHEN** タイトル画面が表示される
- **THEN** 画面上に `v{バージョン番号}` の形式でバージョンが表示される

### Requirement: 難易度ボタン共通コンポーネント

タイトル画面とリザルト画面の難易度ボタンは同一の `DifficultyButtons` コンポーネントで実装しなければならない（SHALL）。

#### Scenario: タイトル画面での難易度ボタン

- **WHEN** タイトル画面が表示される
- **THEN** `DifficultyButtons` コンポーネントが難易度ボタン群を描画し、タップで `kakutei:startGame` が発火する

#### Scenario: リザルト画面での難易度ボタン

- **WHEN** リザルト画面が表示される
- **THEN** `DifficultyButtons` コンポーネントが難易度ボタン群を描画し、タップで `kakutei:retryGame` が発火する
