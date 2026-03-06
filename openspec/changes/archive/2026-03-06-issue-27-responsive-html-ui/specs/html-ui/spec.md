# Spec: html-ui

## ADDED Requirements

### Requirement: HTML HUD オーバーレイ

ゲームプレイ中の HUD（レシート収集数・進行距離）は HTML 要素として Phaser キャンバスの上に重ねて表示しなければならない（SHALL）。縦画面・横画面で同じ HTML 要素を使い、CSS により表示位置を調整する。

#### Scenario: HUD の表示

- **WHEN** ゲームが進行中である
- **THEN** Phaser キャンバスの上に重なった HTML 要素にレシート収集数（`収集数 / 総数`）と進行距離（`Xm`）が表示される

#### Scenario: HUD の更新

- **WHEN** レシートを収集するまたはスクロール距離が変化する
- **THEN** HUD の HTML 要素が即座に最新の値に更新される

#### Scenario: HUD の縦横共通デザイン

- **WHEN** 縦画面または横画面に切り替わる
- **THEN** HUD の HTML 要素は同一の DOM 要素であり、CSS クラスの切り替えにより表示位置が調整される

### Requirement: HTML タイトル画面

タイトル画面は Phaser シーンではなく HTML 要素として実装しなければならない（SHALL）。Phaser の `TitleScene` は廃止する。

#### Scenario: タイトル画面の表示

- **WHEN** `kakutei:assetsLoaded` イベントを受信する
- **THEN** HTML タイトル画面が表示される
- **AND** タイトル名・難易度選択ボタン・スタートボタン・操作説明が HTML 要素として描画される

#### Scenario: 難易度選択

- **WHEN** ユーザーが難易度ボタンをタップする
- **THEN** 選択状態がハイライトされる
- **AND** その難易度でゲームを開始できる状態になる

#### Scenario: ゲーム開始

- **WHEN** ユーザーがスタートボタンを押す
- **THEN** `kakutei:startGame` イベントが `{ difficultyId }` とともに発火する
- **AND** HTML タイトル画面が非表示になる
- **AND** Phaser の GameScene が起動する

### Requirement: HTML リザルト画面

リザルト画面は Phaser シーンではなく HTML 要素として実装しなければならない（SHALL）。Phaser の `ResultScene` は廃止する。

#### Scenario: リザルト画面の表示

- **WHEN** `kakutei:gameResult` イベントを受信する
- **THEN** HTML リザルト画面が表示される
- **AND** 結果（クリア / ゲームオーバー）・レシート回収率・SNSシェアボタン・リトライボタンが HTML 要素として描画される

#### Scenario: SNS シェア

- **WHEN** ユーザーがシェアボタンを押す
- **THEN** Web Share API が使用可能な場合は `navigator.share()` を呼び出す
- **AND** Web Share API が非対応の場合は Twitter 投稿 URL を新規タブで開く

#### Scenario: リトライ

- **WHEN** ユーザーがリトライの難易度ボタンを押す
- **THEN** `kakutei:retryGame` イベントが `{ difficultyId }` とともに発火する
- **AND** HTML リザルト画面が非表示になる
- **AND** Phaser の GameScene が指定難易度で再起動する

### Requirement: Phaser と HTML UI 間のイベント通信

Phaser ゲームと HTML UI 層は `window.dispatchEvent` によるカスタムイベントで通信しなければならない（SHALL）。両層が直接参照を持つ双方向依存を持ってはならない（SHALL NOT）。

#### Scenario: Phaser → HTML への通知

- **WHEN** Phaser 側でゲーム状態が変化する（アセット読み込み完了・ゲーム終了）
- **THEN** `kakutei:` プレフィックス付きのカスタムイベントが `window` に発火される

#### Scenario: HTML → Phaser への指示

- **WHEN** HTML UI からゲーム開始・リトライの操作が行われる
- **THEN** `kakutei:` プレフィックス付きのカスタムイベントが `window` に発火される
- **AND** `main.ts` がそのイベントを受け取り Phaser シーンを操作する
