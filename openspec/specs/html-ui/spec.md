# Spec: html-ui

## Requirement: HTML HUD オーバーレイ

ゲームプレイ中の HUD（レシート収集数・進行距離）は HTML 要素として Phaser キャンバスの上に重ねて表示しなければならない（SHALL）。縦画面・横画面で同じ HTML 要素を使い、CSS により表示位置を調整する。

### Scenario: HUD の表示

- **WHEN** ゲームが進行中である
- **THEN** Phaser キャンバスの上に重なった HTML 要素にレシート収集数（`収集数 / 総数`）と進行距離（`Xm`）が表示される

### Scenario: HUD の更新

- **WHEN** レシートを収集するまたはスクロール距離が変化する
- **THEN** HUD の HTML 要素が即座に最新の値に更新される

### Scenario: HUD の縦横共通デザイン

- **WHEN** 縦画面または横画面に切り替わる
- **THEN** HUD の HTML 要素は同一の DOM 要素であり、CSS クラスの切り替えにより表示位置が調整される

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
- **AND** 結果（クリア / ゲームオーバー）・レシート回収率・SNSシェアボタン・リトライボタンが HTML 要素として描画される

### Scenario: SNS シェア

- **WHEN** ユーザーがシェアボタンを押す
- **THEN** Web Share API が使用可能な場合は `navigator.share()` を呼び出す
- **AND** Web Share API が非対応の場合は Twitter 投稿 URL を新規タブで開く

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
