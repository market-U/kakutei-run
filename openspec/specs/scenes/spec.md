# Spec: scenes

## Requirement: BootScene（アセット読み込み）

ゲーム起動直後に全アセットのロードを行うシーンである。

### Scenario: アセットのロード開始

- **WHEN** ゲームが起動する
- **THEN** BootScene が最初のシーンとして実行され、全スプライトシート・静止画・音声の読み込みを開始する

### Scenario: ローディング進捗表示

- **WHEN** アセットの読み込みが進行中である
- **THEN** 画面上にシンプルな矩形のプログレスバーが表示され、読み込み進捗が視覚的にわかる

### Scenario: 読み込み完了後の通知

- **WHEN** 全アセットの読み込みが完了する
- **THEN** `kakutei:assetsLoaded` カスタムイベントが `window` に発火される
- **AND** HTML タイトル UI がイベントを受信してタイトル画面を表示する

---

## Requirement: HTML UI レイヤー

タイトル・リザルト・HUD は Phaser シーンではなく、HTML/CSS の UI レイヤーとして実装する。Phaser と HTML の間はカスタムイベントで疎結合に通信する。

| イベント名 | 発火元 | 受信先 | ペイロード |
|---|---|---|---|
| `kakutei:assetsLoaded` | BootScene | TitleUI | なし |
| `kakutei:startGame` | TitleUI | main.ts | `{ difficultyId }` |
| `kakutei:gameResult` | GameScene | ResultUI | `{ result, collected, total, difficultyId }` |
| `kakutei:retryGame` | ResultUI | main.ts | `{ difficultyId }` |
| `kakutei:orientationChanged` | OrientationManager | GameScene | `{ orientation }` |

### Scenario: タイトル画面の表示

- **WHEN** `kakutei:assetsLoaded` イベントが発火する
- **THEN** `#title-screen` が表示され、難易度選択ボタンとスタートボタンが操作できる状態になる

### Scenario: ゲーム開始

- **WHEN** プレーヤーがスタートボタンを押す
- **THEN** `kakutei:startGame` イベントが `{ difficultyId }` とともに発火し、Phaser の GameScene が起動する

### Scenario: リザルト画面の表示

- **WHEN** `kakutei:gameResult` イベントが発火する
- **THEN** `#result-screen` が表示され、結果・レシート回収率・SNSシェアボタン・リトライボタンが表示される

### Scenario: 難易度を変えてリトライ

- **WHEN** プレーヤーがリトライボタンから難易度を選択してリトライする
- **THEN** `kakutei:retryGame` イベントが発火し、選択した難易度で GameScene が再起動する

---

## Requirement: ゲームシーン

ゲームプレイ本体のシーン。ゲームプレイゾーン（y=0〜540）で行われ、HUD は HTML オーバーレイが担う。

### Scenario: HUD表示

- **WHEN** ゲームが進行中である
- **THEN** Phaser キャンバスの上に重なった HTML オーバーレイ（`#hud-overlay`）に現在の収集レシート数/総数・進行距離が表示される

### Scenario: ゲームプレイの描画範囲

- **WHEN** ゲームが進行中である
- **THEN** 横スクロールゲームのすべてのオブジェクト（プレーヤー・障害物・アイテム・背景・地面）はゲームプレイゾーン（y=0〜540）内に描画される

### Scenario: ゴール到達判定（X座標交差）

- **WHEN** スクロール中に税務署スプライトの画面 X 座標がプレーヤーの X 座標以下になる
- **THEN** プレーヤーの状態（通常走行・腰痛スロー問わず）にかかわらずゴール判定が発火し、クリアシーケンスに入る

### Scenario: 腰痛スロー中のゴール到達

- **WHEN** プレーヤーが腰痛スロー（`back_pain_slow`）状態で税務署の X 座標を通過する
- **THEN** ゴール判定が発火し、通常走行時と同様にクリアシーケンスに入る

### Scenario: 税務署の表示位置

- **WHEN** ゲームシーンが生成される
- **THEN** 税務署スプライトは底辺が地面上端（`GROUND_Y + GAME_ZONE_Y` = `GROUND_Y`）に揃って表示される

### Scenario: ゲーム終了後の結果通知

- **WHEN** クリアまたはゲームオーバーが確定する
- **THEN** `kakutei:gameResult` カスタムイベントが `{ result, collected, total, difficultyId }` とともに `window` に発火される

---

## Requirement: ポーズ機能

ゲームプレイ中はいつでもポーズできなければならない（SHALL）。

### Scenario: ポーズボタンによるポーズ

- **WHEN** ゲームプレイ中にプレーヤーがポーズボタン（`#pause-btn`）を押す
- **THEN** ゲームスクロールが一時停止し、`#pause-overlay` が表示される

### Scenario: 端末回転によるポーズ

- **WHEN** GameScene がアクティブ中に `kakutei:orientationChanged` イベントが発火する
- **THEN** ゲームスクロールが一時停止し、`#pause-overlay` が表示される

### Scenario: ポーズ解除

- **WHEN** ポーズ中にプレーヤーが `#pause-overlay` をタップする
- **THEN** ゲームスクロールが再開し、`#pause-overlay` が非表示になる

---

## Requirement: スマートフォン対応

ゲームはスマートフォンの縦画面（ポートレート）でもプレイ可能である。横画面は PC 等のデバイスで Scale.FIT により自動スケーリングされる。スマホ横画面は非対応。

### Scenario: Scale.FIT によるスケーリング

- **WHEN** デバイスの画面サイズがキャンバスの論理サイズ（960×540）と異なる
- **THEN** Scale.FIT が縦横比を保ったままキャンバスを拡大縮小する

### Scenario: タッチ操作の誤操作防止

- **WHEN** スマートフォンでタッチ操作する
- **THEN** ブラウザのスクロール・ピンチズームが発生しない
- **AND** viewport に `user-scalable=no` が設定されている

---

## Requirement: クリア演出

ゴール到達時に「確定！！」の演出が再生される。

### Scenario: 確定演出の再生

- **WHEN** プレーヤーがゴールに到達する
- **THEN** ゲームプレイゾーンの中央に「確定！！」のテキストが大きく表示され、紙吹雪パーティクルが再生される

---

## Requirement: Enemy の描画順（depth）

Enemy はプレーヤーより手前に描画されなければならない（SHALL）。

### Scenario: Enemy とプレーヤーの重なり時の表示

- **WHEN** Enemy とプレーヤーが画面上で重なる
- **THEN** Enemy がプレーヤーよりも手前に表示される

### Scenario: Enemy の depth 定義

- **WHEN** ゲームシーンが描画される
- **THEN** Enemy の depth は Player の depth より大きくなければならない（SHALL）
- **AND** Enemy の depth は 11 とする（Player は 10 のまま変更なし）

---

## Requirement: Enemy の矩形オーバーラップ衝突判定

Enemy（追跡キャラ）がプレーヤーに到達したかの判定は、X 座標の閾値ではなく Player と Enemy のスプライト矩形同士の AABB 交差判定で行わなければならない（SHALL）。魔女被弾回数がいかなる値であっても、それ単独でゲームオーバーを発火させてはならない（SHALL NOT）。

### Scenario: Enemy がプレーヤーに接触

- **WHEN** 追跡中の Enemy のヒットボックス矩形と Player のスプライト矩形が重なる
- **THEN** `enemyReached` イベントが発火する

### Scenario: Enemy がプレーヤーに接触していない

- **WHEN** 追跡中の Enemy のヒットボックス矩形と Player のスプライト矩形が重なっていない
- **THEN** `enemyReached` イベントは発火しない

### Scenario: Enemy のヒットボックスサイズ

- **WHEN** Enemy の `getHitBounds()` が呼ばれる
- **THEN** `displayWidth * 0.8` × `displayHeight * 0.8` の矩形が返される

### Scenario: 魔女3回被弾時のゲームオーバー非即発

- **WHEN** プレーヤーが3回目の魔女に接触する
- **THEN** 腰痛スロー状態が適用され、ゲームオーバーは発火しない
- **AND** Enemy が Player の矩形に重なった時点で初めてゲームオーバーになる

### Scenario: 魔女被弾回数によるゲームオーバー直結の禁止

- **WHEN** プレーヤーが魔女に何回接触しても
- **THEN** 魔女被弾回数（hitCount）だけを根拠に `enemyReached` イベントまたはゲームオーバーシーケンスを発火させてはならない（SHALL NOT）

---

## Requirement: 腰痛スロー中の石ころ被弾による転倒

プレーヤーが腰痛スロー状態（`back_pain_slow`）中に石ころへ衝突した場合、通常走行中と同様に転倒シーケンスが起動しなければならない（SHALL）。

### Scenario: 腰痛スロー中に石ころへ衝突

- **WHEN** ゲームシーンの状態が `back_pain_slow` のときプレーヤーが石ころに衝突する
- **THEN** `player_fall` アニメーションが再生される
- **AND** ゲームシーンの状態が `stone_fall_coasting` に遷移する
- **AND** 腰痛スロータイマーがキャンセルされる

### Scenario: 腰痛スロー中転倒後のスクロール停止

- **WHEN** `back_pain_slow` 中の石ころ被弾により `stone_fall_coasting` に遷移した後、`player_fall` アニメーションが完了する
- **THEN** スクロールが停止する
- **AND** ゲームシーンの状態が `stone_fall` に遷移する
- **AND** 敵の追跡が開始される

### Scenario: 腰痛スロー中転倒後のスクロール速度

- **WHEN** `back_pain_slow` 中の石ころ被弾により `stone_fall_coasting` に遷移する
- **THEN** `stone_fall_coasting` 中のスクロール速度は被弾直前の slowed speed のまま変更されない

---

## Requirement: 最大スクロール距離超過によるゲーム強制終了

状態遷移の考慮漏れ等により異常にスクロールが継続した場合、ゲームは最大スクロール距離を超えた時点で強制的にゲームオーバーとして終了しなければならない（SHALL）。

### Scenario: 最大スクロール距離を超過した場合の強制終了

- **WHEN** `scrolledX` が `difficulty.stageLength + 500` を超過する
- **THEN** スクロールが停止する
- **AND** ゲームシーンの状態が `game_over` に遷移する
- **AND** 2 秒後に `result: "gameover"` で `kakutei:gameResult` イベントが発火する

### Scenario: 正常なゴール到達時の誤発動防止

- **WHEN** プレーヤーが正常にゴール（税務署）に到達してクリアシーケンスに入る
- **THEN** 最大スクロール距離チェックは発動せず、クリアシーケンスが継続される
