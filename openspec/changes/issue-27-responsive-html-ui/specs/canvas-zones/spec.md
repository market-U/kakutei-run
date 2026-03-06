# Spec: canvas-zones

## MODIFIED Requirements

### Requirement: キャンバスサイズと3ゾーン分割

ゲームキャンバスは 960×1440（2:3）の縦長サイズとし、上から3つのゾーンに分割する。

- **UI上部ゾーン**: y=0〜360（高さ360px）—— Phaser 上では背景色のみの無地領域。UI表示の責務は HTML オーバーレイが担う
- **ゲームプレイゾーン**: y=360〜900（高さ540px）—— すべてのゲームオブジェクトを描画する
- **UI下部ゾーン**: y=900〜1440（高さ540px）—— Phaser 上では背景色のみの無地領域。UI表示の責務は HTML オーバーレイが担う

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

#### Scenario: UI ゾーンの無地化

- **WHEN** ゲームが起動している
- **THEN** Phaser のUI上部ゾーン（y=0〜360）およびUI下部ゾーン（y=900〜1440）には Phaser テキストオブジェクト・ボタン等のUI要素が一切配置されない
- **AND** 両UIゾーンはキャンバス背景色（または単色）のみで描画される

## REMOVED Requirements

### Requirement: UI下部ゾーンのタップ受付

**Reason**: UI下部ゾーンが Phaser 上では無地になるため。ゲームプレイ中のジャンプ入力は引き続きキャンバス全体（縦画面）またはゲームゾーン全体（横画面）のタップで受け付けるが、それは Player.setupInput() の既存実装で変わらず動作する。

**Migration**: 既存の `Player.setupInput()` の実装変更は不要。横画面時はカメラビューポートがゲームゾーンのみを映すため、タップ範囲はゲームゾーンと一致する。
