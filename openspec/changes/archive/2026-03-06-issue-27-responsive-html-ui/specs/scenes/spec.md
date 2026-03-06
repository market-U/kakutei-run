# Spec: scenes

## MODIFIED Requirements

### Requirement: BootScene（アセット読み込み）

ゲーム起動直後に全アセットのロードを行うシーンである。

#### Scenario: アセットのロード開始

- **WHEN** ゲームが起動する
- **THEN** BootScene が最初のシーンとして実行され、全スプライトシート・静止画・音声の読み込みを開始する

#### Scenario: ローディング進捗表示

- **WHEN** アセットの読み込みが進行中である
- **THEN** 画面上にシンプルな矩形のプログレスバーが表示され、読み込み進捗が視覚的にわかる

#### Scenario: 読み込み完了後の通知

- **WHEN** 全アセットの読み込みが完了する
- **THEN** `kakutei:assetsLoaded` カスタムイベントが `window` に発火される
- **AND** HTML タイトル画面が表示される（HTML UI 層がイベントを受信してタイトルを表示する）

### Requirement: ゲームシーン

ゲームプレイ本体のシーンでHUD情報を表示する。ゲームプレイはゲームプレイゾーン（y=360〜900）で行われ、HUDはHTML オーバーレイで表示する。

#### Scenario: HUD表示

- **WHEN** ゲームが進行中である
- **THEN** Phaser キャンバスの上に重なった HTML オーバーレイにレシート収集数・進行距離が表示される

#### Scenario: ゲームプレイの描画範囲

- **WHEN** ゲームが進行中である
- **THEN** 横スクロールゲームのすべてのオブジェクト（プレーヤー・障害物・アイテム・背景・地面）はゲームプレイゾーン（y=360〜900）内に描画される

#### Scenario: ゴール到達判定（X座標交差）

- **WHEN** スクロール中に税務署スプライトの画面 X 座標がプレーヤーの X 座標以下になる
- **THEN** プレーヤーの状態（通常走行・腰痛スロー問わず）にかかわらずゴール判定が発火し、クリアシーケンスに入る

#### Scenario: 腰痛スロー中のゴール到達

- **WHEN** プレーヤーが腰痛スロー（`back_pain_slow`）状態で税務署の X 座標を通過する
- **THEN** ゴール判定が発火し、通常走行時と同様にクリアシーケンスに入る

#### Scenario: 税務署の表示位置

- **WHEN** ゲームシーンが生成される
- **THEN** 税務署スプライトは底辺が地面上端（`GROUND_Y + GAME_ZONE_Y`）に揃って表示される

#### Scenario: ゲーム終了後の結果通知

- **WHEN** クリアまたはゲームオーバーが確定する
- **THEN** `kakutei:gameResult` カスタムイベントが `{ result, collected, total, difficultyId }` とともに `window` に発火される
- **AND** HTML リザルト画面がイベントを受信して表示される

## REMOVED Requirements

### Requirement: タイトルシーン

**Reason**: タイトル画面を HTML/CSS による実装に移行するため Phaser シーンとしての実装を廃止する。難易度選択・ゲーム開始ロジックは `src/ui/TitleUI.ts` に移管する。

**Migration**: `TitleUI.ts` が `kakutei:startGame` イベントを発火し、`main.ts` が受け取って `GameScene` を起動する。`BootScene` の `create()` は `scene.start("TitleScene")` ではなく `kakutei:assetsLoaded` イベントを発火する。

### Requirement: リザルトシーン

**Reason**: リザルト画面を HTML/CSS による実装に移行するため Phaser シーンとしての実装を廃止する。スコア表示・SNSシェア・リトライロジックは `src/ui/ResultUI.ts` に移管する。

**Migration**: `GameScene` はシーン遷移（`this.scene.start("ResultScene", ...)`）の代わりに `kakutei:gameResult` カスタムイベントを発火する。`ResultUI.ts` がイベントを受け取りリザルトを表示する。

### Requirement: スマートフォン縦画面フルスクリーン対応

**Reason**: 縦横両画面対応の要件は `orientation-layout` スペックに移管した。このスペックは縦画面のみを対象としていたため廃止する。

**Migration**: `orientation-layout` スペックの「縦横レイアウトの切り替え」要件を参照すること。
