# Spec: canvas-zones

## Requirement: キャンバスサイズ

ゲームキャンバスは 960×540（16:9）の横長サイズとする。HUD・タイトル・リザルトは HTML/CSS の UI レイヤーが担うため、Phaser キャンバスはゲームプレイゾーンのみを描画する。

ゾーン境界の定数は一元管理し、各シーンから参照できるものとする。

### Scenario: キャンバスサイズの設定

- **WHEN** ゲームが初期化される
- **THEN** Phaser の GameConfig にて width=960, height=540 が設定される
- **AND** Scale モードは `Phaser.Scale.FIT`、autoCenter は `Phaser.Scale.CENTER_BOTH` である
- **AND** `#game-container` は `width: 100%; height: 100%` が設定されており、Scale.FIT が `body` サイズに合わせてキャンバスをスケーリングする

### Scenario: ゾーン定数のエクスポート

- **WHEN** 各シーンがゾーン座標を参照する
- **THEN** `GAME_ZONE_Y = 0`（ゲームプレイゾーン開始Y）が定数としてインポート可能である
- **AND** `GAME_ZONE_HEIGHT = 540`（ゲームプレイゾーンの高さ）が定数としてインポート可能である
- **AND** `CANVAS_W = 960`、`CANVAS_H = 540` が定数としてインポート可能である

---

## Requirement: ゲームプレイゾーン内の座標体系

ゲームプレイゾーン（y=0〜540）内のオブジェクト配置は、960×540 座標系をそのまま使用する。`GAME_ZONE_Y = 0` のため、オブジェクトの画面Y座標にオフセット加算は不要である。

### Scenario: ゲームオブジェクトのY座標

- **WHEN** ゲームプレイゾーンにオブジェクト（プレーヤー・石・魔女・レシート・税務署・敵）を配置する
- **THEN** 各オブジェクトの画面Y座標はゲームロジック上のY座標と一致する（オフセット加算なし）

### Scenario: 地面の配置

- **WHEN** 地面コライダーと地面 TileSprite を配置する
- **THEN** 地面の画面Y座標は `GROUND_Y + GAME_ZONE_Y`（= `GROUND_Y`）に配置される

### Scenario: 背景スクロールの制限

- **WHEN** ScrollManager が視差スクロール背景を描画する
- **THEN** 背景 TileSprite はゲームプレイゾーン（y=0, 高さ540px）内に限定して描画される

---

## Requirement: 全画面タッチ入力

ゲームプレイ中のジャンプ操作は、キャンバス外を含む画面全体（とくに下部）のタップで受け付けられなければならない（SHALL）。

### Scenario: キャンバス外タップでのジャンプ

- **WHEN** ゲームプレイ中にプレーヤーがキャンバスの外側（キャンバス下方の黒帯部分など）をタップする
- **THEN** キャンバス内タップと同様にジャンプ操作として処理される

### Scenario: ボタン・ポーズオーバーレイへのタップ除外

- **WHEN** ゲームプレイ中にプレーヤーが `<button>` 要素または `#pause-overlay` をタップする
- **THEN** ジャンプ操作は発火しない（それぞれのボタン本来の動作のみが行われる）

### Scenario: document レベルのイベント登録

- **WHEN** GameScene が生成される
- **THEN** `document.addEventListener('pointerdown')` と `document.addEventListener('pointerup')` でジャンプ操作を受け付ける
- **AND** GameScene の SHUTDOWN 時にこれらのリスナーが `removeEventListener` で解除される

---

## Requirement: viewport 設定

スマートフォンでのタッチ操作中にブラウザのスクロール・ピンチズームが発生しない。

### Scenario: viewport meta タグの設定

- **WHEN** ゲームページが読み込まれる
- **THEN** viewport meta タグに `user-scalable=no` が含まれる
- **AND** canvas に `touch-action: none` と `user-select: none` が設定されている

### Scenario: モバイルブラウザの実表示エリアへの適合

- **WHEN** スマートフォンのブラウザ（Safari など）でアドレスバーが表示されている
- **THEN** `body` の `height: 100svh` により、アドレスバーを除いた実際の表示エリアにキャンバスが収まる
