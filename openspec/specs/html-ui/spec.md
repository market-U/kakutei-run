# Spec: html-ui

## Requirement: HTML HUD オーバーレイ

ゲームプレイ中の HUD（レシート収集数・進行距離・操作方法）は HTML 要素として Phaser キャンバスの上に重ねて表示しなければならない（SHALL）。HUD は3段構成（上スペーサー・中段・下段）の Flex コンテナとして実装し、`ResizeObserver` でキャンバスの実際の描画位置を追跡して CSS 変数（`--canvas-top` / `--canvas-height`）に反映することで、縦横どちらの向きでもキャンバスに隣接した位置に情報を表示しなければならない（SHALL）。

### Scenario: HUD の表示（縦画面）

- **WHEN** ゲームが縦画面（portrait）で進行中である
- **THEN** レシート収集数と進行距離がキャンバスの上端に隣接した `hud-middle` 上部左に表示される
- **AND** ポーズボタンとコメントトグルボタンが `hud-middle` 上部右に表示される
- **AND** 操作方法テキストがキャンバス下端に隣接した `hud-bottom` 上部に表示される

### Scenario: HUD の表示（横画面）

- **WHEN** ゲームが横画面（landscape）で進行中である
- **THEN** レシート収集数と進行距離がキャンバスの上端に隣接した `hud-middle` 上部左に表示される
- **AND** ポーズボタンとコメントトグルボタンが `hud-middle` 上部右に表示される
- **AND** 操作方法テキストが `hud-middle` 下端に表示される

### Scenario: HUD の更新

- **WHEN** レシートを収集するまたはスクロール距離が変化する
- **THEN** HUD の HTML 要素が即座に最新の値に更新される

### Scenario: 端末回転時の HUD 追従

- **WHEN** 端末が縦画面と横画面の間で回転する
- **THEN** `ResizeObserver` がキャンバスのサイズ変化を検知し CSS 変数が更新される
- **AND** HUD の各セクションがキャンバスの新しい位置に自動追従する

---

## Requirement: HTML タイトル画面

タイトル画面は Phaser シーンではなく HTML 要素として実装しなければならない（SHALL）。Phaser の `TitleScene` は廃止する。

### Scenario: タイトル画面の表示

- **WHEN** `kakutei:assetsLoaded` イベントを受信する
- **THEN** HTML タイトル画面が表示される
- **AND** タイトルロゴ画像・難易度選択ボタン・操作説明・アプリバージョンが HTML 要素として描画される

### Scenario: 難易度ボタン1タップでゲーム開始

- **WHEN** ユーザーが難易度ボタンをタップする
- **THEN** `kakutei:startGame` イベントが `{ difficultyId }` とともに発火する
- **AND** HTML タイトル画面が非表示になる
- **AND** Phaser の GameScene が起動する

### Scenario: 縦画面レイアウト

- **WHEN** タイトル画面が縦画面（portrait）で表示される
- **THEN** ロゴ・難易度ボタン・操作説明・バージョンが縦に並んで表示される
- **AND** 内容が画面の高さを超える場合はスクロール可能である

### Scenario: 横画面レイアウト

- **WHEN** タイトル画面が横画面（landscape）で表示される
- **THEN** 左カラムにロゴ画像・タイトル文字、右カラムに難易度ボタン・操作説明・バージョンが表示される
- **AND** 要素が画面外にはみ出さない

---

## Requirement: タイトルロゴ画像の表示

タイトル画面にはロゴ画像要素を配置しなければならない（SHALL）。正式アセットが未準備の場合はプレースホルダー画像を使用し、差し替えは画像ファイルの置き換えのみで完結しなければならない（SHALL）。

### Scenario: プレースホルダー画像の表示

- **WHEN** タイトル画面が表示される
- **THEN** `public/assets/ui/title_logo.png` がロゴ画像として表示される

### Scenario: 正式アセットへの差し替え

- **WHEN** 正式なロゴ画像を配置する
- **THEN** `public/assets/ui/title_logo.png` を同名の PNG で上書きするだけでコード変更なく反映される

---

## Requirement: アプリバージョン表記

タイトル画面にはアプリバージョンを表示しなければならない（SHALL）。バージョン値は `package.json` の `version` フィールドから Vite の `define` 機能で埋め込まれる。

### Scenario: バージョン表示

- **WHEN** タイトル画面が表示される
- **THEN** 画面上に `v{バージョン番号}` の形式でバージョンが表示される

---

## Requirement: 難易度ボタン共通コンポーネント

タイトル画面とリザルト画面の難易度ボタンは同一の `DifficultyButtons` コンポーネントで実装しなければならない（SHALL）。

### Scenario: タイトル画面での難易度ボタン

- **WHEN** タイトル画面が表示される
- **THEN** `DifficultyButtons` コンポーネントが難易度ボタン群を描画し、タップで `kakutei:startGame` が発火する

### Scenario: リザルト画面での難易度ボタン

- **WHEN** リザルト画面が表示される
- **THEN** `DifficultyButtons` コンポーネントが難易度ボタン群を描画し、タップで `kakutei:retryGame` が発火する

---

## Requirement: HTML リザルト画面

リザルト画面は Phaser シーンではなく HTML 要素として実装しなければならない（SHALL）。Phaser の `ResultScene` は廃止する。

### Scenario: リザルト画面の表示

- **WHEN** `kakutei:gameResult` イベントを受信する
- **THEN** HTML リザルト画面が表示される
- **AND** 結果（クリア / ゲームオーバー）・レシート取得率・SNSシェアボタン・リトライボタンが HTML 要素として描画される

### Scenario: SNS シェア（画像あり）

- **WHEN** ユーザーがシェアボタンを押す
- **AND** `navigator.canShare({ files: [...] })` が `true` を返す
- **THEN** Canvas API で生成した 1080×1080px の画像ファイルと本文テキスト（URL + `#確定RUN`）を `navigator.share()` に渡して共有する

### Scenario: SNS シェア（画像非対応環境のフォールバック）

- **WHEN** ユーザーがシェアボタンを押す
- **AND** `navigator.canShare({ files: [...] })` が `false` を返すまたは `navigator.share` が存在しない
- **THEN** テキストのみの Twitter intent URL を新規タブで開く
- **AND** テキストには難易度フレーズ・レシート取得率・バージョン・URL・`#確定RUN` を含める

### Scenario: シェアテキストのフレーズ（クリア時）

- **WHEN** クリア結果でシェアが実行される
- **THEN** テキストの先頭フレーズは `<難易度名> 確定成功！` となる

### Scenario: シェアテキストのフレーズ（ゲームオーバー時）

- **WHEN** ゲームオーバー結果でシェアが実行される
- **THEN** テキストの先頭フレーズは `<難易度名> 確定ならず…` となる

### Scenario: リトライ

- **WHEN** ユーザーがリトライの難易度ボタンを押す
- **THEN** `kakutei:retryGame` イベントが `{ difficultyId }` とともに発火する
- **AND** HTML リザルト画面が非表示になる
- **AND** Phaser の GameScene が指定難易度で再起動する

---

## Requirement: HTML UI でのテキスト選択禁止

HTML UI オーバーレイ全体（HUD・タイトル画面・リザルト画面・ポーズオーバーレイを含む）において、ユーザーによるテキスト選択を禁止しなければならない（SHALL）。また iOS Safari のロングタップコンテキストメニューを表示してはならない（SHALL NOT）。

### Scenario: ロングタップ時にテキストが選択されない

- **WHEN** ユーザーが HTML UI 要素上でロングタップ（長押し）操作を行う
- **THEN** テキストが選択状態にならない
- **AND** ブラウザのテキスト選択ハイライトが表示されない

### Scenario: iOS Safari のコンテキストメニューが表示されない

- **WHEN** iOS Safari 上でユーザーが HTML UI 要素上でロングタップする
- **THEN** 「コピー / 選択 / 全選択」コンテキストメニューが表示されない

---

## Requirement: Phaser と HTML UI 間のイベント通信

Phaser ゲームと HTML UI 層は `window.dispatchEvent` によるカスタムイベントで通信しなければならない（SHALL）。両層が直接参照を持つ双方向依存を持ってはならない（SHALL NOT）。

### Scenario: Phaser → HTML への通知

- **WHEN** Phaser 側でゲーム状態が変化する（アセット読み込み完了・ゲーム終了）
- **THEN** `kakutei:` プレフィックス付きのカスタムイベントが `window` に発火される

### Scenario: HTML → Phaser への指示

- **WHEN** HTML UI からゲーム開始・リトライの操作が行われる
- **THEN** `kakutei:` プレフィックス付きのカスタムイベントが `window` に発火される
- **AND** `main.ts` がそのイベントを受け取り Phaser シーンを操作する

---

## Requirement: コメントトグルボタン

ゲームプレイ中の HUD にコメント表示の ON/OFF を切り替えるボタンを設けなければならない（SHALL）。
ボタンは `pause-btn` と同様に HTML 要素として実装し、ゲームプレイ中のみ表示される。

### Scenario: コメントトグルボタンの表示

- **WHEN** ゲームプレイが開始される（HUD が表示される）
- **THEN** コメントトグルボタンが `pause-btn` と並んで画面上部に表示される

### Scenario: コメントトグルボタンの非表示

- **WHEN** ゲームが終了し HUD が非表示になる
- **THEN** コメントトグルボタンも合わせて非表示になる

### Scenario: OFF 状態の視覚フィードバック

- **WHEN** コメントが OFF 状態である
- **THEN** ボタンの透明度が下がり（例: opacity: 0.4）OFF であることが視覚的に判別できる

---

## Requirement: HUD 操作方法テキスト

HUD の下段には操作方法とルールを1文で表示しなければならない（SHALL）。

### Scenario: 縦画面での操作方法テキスト表示

- **WHEN** ゲームが縦画面で進行中である
- **THEN** 操作方法テキストがキャンバス下端の余白（`hud-bottom`）に表示される
- **AND** テキストは半透明背景のバッジスタイルで表示される

### Scenario: 横画面での操作方法テキスト表示

- **WHEN** ゲームが横画面で進行中である
- **THEN** 操作方法テキストが `hud-middle` の下端に表示される
- **AND** テキストは半透明背景のバッジスタイルで表示される

---

## Requirement: キャンバス位置の CSS 変数管理

HUD はキャンバス要素を `ResizeObserver` で監視し、CSS 変数でレイアウトを制御しなければならない（SHALL）。

### Scenario: CSS 変数の初期化

- **WHEN** HUD が生成される
- **THEN** `--canvas-top` と `--canvas-height` が `document.documentElement` に設定される
- **AND** キャンバス要素が取得できない場合はフォールバック値（top: 0 / height: 100%）で初期化される

### Scenario: CSS 変数の更新

- **WHEN** `ResizeObserver` がキャンバスのサイズ変化を検知する
- **THEN** `--canvas-top` にキャンバスの `getBoundingClientRect().top` が設定される
- **AND** `--canvas-height` にキャンバスの `getBoundingClientRect().height` が設定される

### Scenario: HUD 破棄時の Observer 解除

- **WHEN** HUD の `destroy()` が呼ばれる
- **THEN** `ResizeObserver` が `disconnect()` される
