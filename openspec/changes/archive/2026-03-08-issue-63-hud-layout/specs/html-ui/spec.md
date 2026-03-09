# Spec Delta: html-ui

## MODIFIED Requirements

### Requirement: HTML HUD オーバーレイ

ゲームプレイ中の HUD（レシート収集数・進行距離・操作方法）は HTML 要素として Phaser キャンバスの上に重ねて表示しなければならない（SHALL）。HUD は3段構成（上スペーサー・中段・下段）の Flex コンテナとして実装し、`ResizeObserver` でキャンバスの実際の描画位置を追跡して CSS 変数（`--canvas-top` / `--canvas-height`）に反映することで、縦横どちらの向きでもキャンバスに隣接した位置に情報を表示しなければならない（SHALL）。

#### Scenario: HUD の表示（縦画面）

- **WHEN** ゲームが縦画面（portrait）で進行中である
- **THEN** レシート収集数と進行距離がキャンバスの上端に隣接した `hud-middle` 上部左に表示される
- **AND** ポーズボタンとコメントトグルボタンが `hud-middle` 上部右に表示される
- **AND** 操作方法テキストがキャンバス下端に隣接した `hud-bottom` 上部に表示される

#### Scenario: HUD の表示（横画面）

- **WHEN** ゲームが横画面（landscape）で進行中である
- **THEN** レシート収集数と進行距離がキャンバスの上端に隣接した `hud-middle` 上部左に表示される
- **AND** ポーズボタンとコメントトグルボタンが `hud-middle` 上部右に表示される
- **AND** 操作方法テキストが `hud-middle` 下端に表示される

#### Scenario: HUD の更新

- **WHEN** レシートを収集するまたはスクロール距離が変化する
- **THEN** HUD の HTML 要素が即座に最新の値に更新される

#### Scenario: 端末回転時の HUD 追従

- **WHEN** 端末が縦画面と横画面の間で回転する
- **THEN** `ResizeObserver` がキャンバスのサイズ変化を検知し CSS 変数が更新される
- **AND** HUD の各セクションがキャンバスの新しい位置に自動追従する

## ADDED Requirements

### Requirement: HUD 操作方法テキスト

HUD の下段には操作方法とルールを1文で表示しなければならない（SHALL）。

#### Scenario: 縦画面での操作方法テキスト表示

- **WHEN** ゲームが縦画面で進行中である
- **THEN** 操作方法テキストがキャンバス下端の余白（`hud-bottom`）に表示される
- **AND** テキストは半透明背景のバッジスタイルで表示される

#### Scenario: 横画面での操作方法テキスト表示

- **WHEN** ゲームが横画面で進行中である
- **THEN** 操作方法テキストが `hud-middle` の下端に表示される
- **AND** テキストは半透明背景のバッジスタイルで表示される

### Requirement: キャンバス位置の CSS 変数管理

HUD はキャンバス要素を `ResizeObserver` で監視し、CSS 変数でレイアウトを制御しなければならない（SHALL）。

#### Scenario: CSS 変数の初期化

- **WHEN** HUD が生成される
- **THEN** `--canvas-top` と `--canvas-height` が `document.documentElement` に設定される
- **AND** キャンバス要素が取得できない場合はフォールバック値（top: 0 / height: 100%）で初期化される

#### Scenario: CSS 変数の更新

- **WHEN** `ResizeObserver` がキャンバスのサイズ変化を検知する
- **THEN** `--canvas-top` にキャンバスの `getBoundingClientRect().top` が設定される
- **AND** `--canvas-height` にキャンバスの `getBoundingClientRect().height` が設定される

#### Scenario: HUD 破棄時の Observer 解除

- **WHEN** HUD の `destroy()` が呼ばれる
- **THEN** `ResizeObserver` が `disconnect()` される
