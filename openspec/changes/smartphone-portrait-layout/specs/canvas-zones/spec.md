# Spec: canvas-zones

## ADDED Requirements

### Requirement: キャンバスサイズと3ゾーン分割

ゲームキャンバスは 960×1440（2:3）の縦長サイズとし、上から3つのゾーンに分割する。

- **UI上部ゾーン**: y=0〜360（高さ360px）
- **ゲームプレイゾーン**: y=360〜900（高さ540px）
- **UI下部ゾーン**: y=900〜1440（高さ540px）

ゾーン境界の定数は一元管理し、各シーンから参照できるものとする。

#### Scenario: キャンバスサイズの設定

- **WHEN** ゲームが初期化される
- **THEN** Phaser の GameConfig にて width=960, height=1440 が設定される
- **AND** Scale モードは `Phaser.Scale.FIT`、autoCenter は `Phaser.Scale.CENTER_BOTH` である

#### Scenario: ゾーン定数のエクスポート

- **WHEN** 各シーンがゾーン座標を参照する
- **THEN** `GAME_ZONE_Y = 360`（ゲームプレイゾーン開始Y）が定数としてインポート可能である
- **AND** `GAME_ZONE_HEIGHT = 540`（ゲームプレイゾーンの高さ）が定数としてインポート可能である
- **AND** `UI_BOTTOM_Y = 900`（UI下部ゾーン開始Y）が定数としてインポート可能である
- **AND** `CANVAS_W = 960`、`CANVAS_H = 1440` が定数としてインポート可能である

---

### Requirement: ゲームプレイゾーン内の座標体系

ゲームプレイゾーン（y=360〜900）内のオブジェクト配置は、既存の960×540座標系にオフセット `GAME_ZONE_Y` を加算して行う。ゲームロジック内部の座標計算には変更を加えない。

#### Scenario: ゲームオブジェクトのY座標

- **WHEN** ゲームプレイゾーンにオブジェクト（プレーヤー・石・魔女・レシート・税務署・敵）を配置する
- **THEN** 各オブジェクトの画面Y座標は、ゲームロジック上のY座標に `GAME_ZONE_Y`（360px）を加算した値になる

#### Scenario: 地面の配置

- **WHEN** 地面コライダーと地面 TileSprite を配置する
- **THEN** 地面の画面Y座標は `GROUND_Y + GAME_ZONE_Y` に配置される

#### Scenario: 背景スクロールの制限

- **WHEN** ScrollManager が視差スクロール背景を描画する
- **THEN** 背景 TileSprite はゲームプレイゾーン（y=360, 高さ540px）内に限定して描画される

---

### Requirement: UI下部ゾーンのタップ受付

ゲームプレイ中、UI下部ゾーン（y=900〜1440）でのタップ操作はジャンプ操作として受付される。

#### Scenario: ゲーム中のUI下部タップ

- **WHEN** ゲームプレイ中にプレーヤーがUI下部ゾーンをタップする
- **THEN** ゲームプレイゾーンをタップした場合と同様にジャンプ操作として処理される

#### Scenario: Phaser 入力の全域受付

- **WHEN** Phaser の `input.on('pointerdown')` がキャンバス全体のイベントを受け付ける
- **THEN** 既存の Player.setupInput() の実装変更なくUI下部タップがジャンプとして動作する

---

### Requirement: viewport 設定

スマートフォンでのタッチ操作中にブラウザのスクロール・ピンチズームが発生しない。

#### Scenario: viewport meta タグの設定

- **WHEN** ゲームページが読み込まれる
- **THEN** viewport meta タグに `user-scalable=no` が含まれる
- **AND** canvas に `touch-action: none` と `user-select: none` が設定されている
