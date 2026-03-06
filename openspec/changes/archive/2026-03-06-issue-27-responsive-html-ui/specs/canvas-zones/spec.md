# Spec: canvas-zones

## MODIFIED Requirements

### Requirement: キャンバスサイズ

ゲームキャンバスは 960×540（16:9）の固定サイズとする。HUD・タイトル・リザルトは HTML/CSS の UI レイヤーが担うため、Phaser キャンバスはゲームプレイゾーンのみを描画する。3ゾーン構成（960×1440）は採用しない。

ゾーン境界の定数は一元管理し、各シーンから参照できるものとする。

#### Scenario: キャンバスサイズの設定

- **WHEN** ゲームが初期化される
- **THEN** Phaser の GameConfig にて width=960, height=540 が設定される
- **AND** Scale モードは `Phaser.Scale.FIT`、autoCenter は `Phaser.Scale.CENTER_BOTH` である
- **AND** `#game-container` は `width: 100%; height: 100%` が設定されており、Scale.FIT が `body` サイズに合わせてスケーリングする

#### Scenario: ゾーン定数のエクスポート

- **WHEN** 各シーンがゾーン座標を参照する
- **THEN** `GAME_ZONE_Y = 0`（ゲームプレイゾーン開始Y）が定数としてインポート可能である
- **AND** `GAME_ZONE_HEIGHT = 540`（ゲームプレイゾーンの高さ）が定数としてインポート可能である
- **AND** `CANVAS_W = 960`、`CANVAS_H = 540` が定数としてインポート可能である

## ADDED Requirements

### Requirement: 全画面タッチ入力

ゲームプレイ中のジャンプ操作は、キャンバス外を含む画面全体のタップで受け付けられなければならない（SHALL）。

#### Scenario: キャンバス外タップでのジャンプ

- **WHEN** ゲームプレイ中にプレーヤーがキャンバスの外側をタップする
- **THEN** キャンバス内タップと同様にジャンプ操作として処理される

#### Scenario: document レベルのイベント登録

- **WHEN** GameScene が生成される
- **THEN** `document.addEventListener('pointerdown')` と `document.addEventListener('pointerup')` でジャンプ操作を受け付ける
- **AND** `<button>` 要素または `#pause-overlay` へのタップはジャンプとして処理しない
- **AND** GameScene の SHUTDOWN 時にリスナーが `removeEventListener` で解除される

## REMOVED Requirements

### Requirement: UI下部ゾーンのタップ受付（旧 Phaser canvas 経由のタップ）

**Reason**: 3ゾーン構成の廃止に伴い、UI下部ゾーン自体が存在しなくなった。全画面タッチ入力は `document` レベルのリスナーで実現する。

**Migration**: `Player.setupInput()` から `input.on("pointerdown/up")` を削除し、`startCharge()`/`releaseJump()` を `public` に変更。`GameScene` が `document.addEventListener` で呼び出す。
