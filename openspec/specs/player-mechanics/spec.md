# Spec: player-mechanics

## Requirement: プレーヤーの初期配置位置

プレーヤーキャラクターはゲーム開始時に画面横中央・地面上に配置される。

### Scenario: 初期配置

- **WHEN** ゲームシーンが初期化される
- **THEN** プレーヤーのX座標は画面横幅の中央（CANVAS_W / 2）に配置される
- **AND** Y座標は地面タイル上端（GROUND_Y）に足底が接地する位置に配置される（石ころと同じ接地基準点）

---

## Requirement: チャージジャンプ入力

プレーヤーはスペースキー（PC）またはタップ（スマホ）の長押しでジャンプパワーをチャージし、リリース時にジャンプが発動する。チャージ量は押下時間に比例し、最大500msで上限（100%）に達する。上限到達後は押し続けてもチャージ量は変化しない。

### Scenario: 短押しで小ジャンプ

- **WHEN** プレーヤーが200ms未満で入力をリリースする
- **THEN** 初速400px/s未満の小ジャンプが発動する

### Scenario: 長押しで大ジャンプ

- **WHEN** プレーヤーが500ms以上押し続けてからリリースする
- **THEN** 初速900px/sの最大ジャンプが発動する

### Scenario: 上限到達後の待機

- **WHEN** プレーヤーが500ms以上押し続けた状態で待機する
- **THEN** チャージ量は100%のまま維持され、リリースするまでジャンプは発動しない

### Scenario: 空中でのジャンプ入力無効

- **WHEN** プレーヤーが空中にいる状態で入力を行う
- **THEN** ジャンプは発動しない

---

## Requirement: プレーヤー状態管理

プレーヤーキャラクターは以下の7つの状態を持ち、状態に応じてアニメーションとスプライト表示が切り替わる。
状態は `grounded` / `isBackPain` / `falling` / `gameOver` の4つのフラグで表現される。

| 状態ID | 状態名 | grounded | isBackPain | falling | gameOver |
|--------|--------|----------|------------|---------|----------|
| S1 | running | true | false | false | false |
| S2 | back_pain_ground | true | true | false | false |
| S3 | jumping | false | false | false | false |
| S4 | jumping_back_pain | false | true | false | false |
| S5 | falling | * | * | true | false |
| S6 | goal | * | * | false | true |
| S7 | enemy_caught | * | * | false | true |

### Scenario: 通常走行状態（S1）

- **WHEN** プレーヤーが地面上にいて `isBackPain=false`
- **THEN** `player_run` アニメーションがループ再生される
- **AND** スプライトは等倍（`scaleX=1.0, scaleY=1.0`）で表示される（チャージ中を除く）

### Scenario: 腰痛スロー状態への遷移（S1/S3 → S2/S4）

- **WHEN** プレーヤーが魔女に接触する
- **THEN** `isBackPain=true` となり、腰痛タイマーが開始される
- **AND** 地面上の場合（S1→S2）は `player_back_pain` アニメーションがループ再生される
- **AND** 空中の場合（S3→S4）は `player_back_pain` の 1フレーム目を表示してアニメーションを停止する
- **AND** スクロール速度が `witchSpeedReduction` 分だけ低下する
- **AND** 腰痛タイマーが満了すると `isBackPain=false` となりスクロール速度が戻る（地上ならS1/S2、空中ならS3/S4へ遷移）

### Scenario: 腰痛スロー状態（S2）のジャンプ（S2 → S4）

- **WHEN** プレーヤーが S2 の状態でジャンプを発動する
- **THEN** S4（jumping_back_pain）に遷移し、現在の `player_back_pain` フレームでアニメーションが停止する
- **AND** スプライトは等倍（`scaleX=1.0, scaleY=1.0`）にリセットされる

### Scenario: 転倒状態への遷移（S1/S2/S3/S4 → S5）

- **WHEN** プレーヤーが石ころに接触する
- **THEN** `falling=true` となり `player_fall` アニメーションが1回再生される
- **AND** スプライトは等倍（`scaleX=1.0, scaleY=1.0`）にリセットされる
- **AND** スクロールが停止し、敵キャラクターが追跡を開始する
- **AND** `gameOver` フラグは立てない（S7 遷移まで待つ）

### Scenario: 転倒中の着地・衝突イベント無視（S5）

- **WHEN** プレーヤーが S5（falling）の状態で地面着地・石接触・魔女接触が発生する
- **THEN** これらのイベントはすべて無視される
- **AND** `player_fall` アニメーションは最終フレームで固定されたまま変化しない

### Scenario: ゴール状態への遷移（S1/S2/S3/S4 → S6）

- **WHEN** プレーヤーが税務署（ゴール）に到達する
- **THEN** `gameOver=true` となり `player_goal` アニメーションがループ再生される
- **AND** スプライトは等倍（`scaleX=1.0, scaleY=1.0`）にリセットされる
- **AND** 空中でゴールに到達した場合、物理落下は継続し地面に着地するが着地イベントによるアニメーション変更は行わない
- **AND** クリアシーケンスに移行する

### Scenario: ジャンプ中のアニメーション停止（S1 → S3、S2 → S4）

- **WHEN** プレーヤーが地面を離れジャンプが発動する
- **THEN** アニメーション再生が停止し、スプライトが現在のフレームに固定される
- **AND** スプライトは等倍（`scaleX=1.0, scaleY=1.0`）にリセットされる

### Scenario: 着地後のアニメーション再開（S3 → S1、S4 → S2）

- **WHEN** プレーヤーが地面に着地する（`falling=false` かつ `gameOver=false` の場合に限る）
- **THEN** `isBackPain=true` であれば `player_back_pain` が、`isBackPain=false` であれば `player_run` がループ再生される
- **AND** 既に同じアニメーションキーが再生中でも、停止状態であれば必ず再起動する

### Scenario: 敵キャラクター到達によるゲームオーバー（S1/S2/S3/S4 → S7）

- **WHEN** 敵キャラクターがプレーヤーに到達し `enemyReached` イベントが発火する（`falling=false` の場合）
- **THEN** `gameOver=true` となりアニメーションが停止される（現在フレームで固定）
- **AND** スプライトは等倍（`scaleX=1.0, scaleY=1.0`）にリセットされる

### Scenario: 転倒後の敵キャラクター到達（S5 → S7）

- **WHEN** 敵キャラクターがプレーヤーに到達し `enemyReached` イベントが発火する（`falling=true` の場合）
- **THEN** `gameOver=true` となるが、スプライトは `player_fall` の最終フレームのまま固定を維持する

---

## Requirement: 状態遷移時のスプライト等倍リセット

プレーヤーがジャンプチャージ以外の状態に遷移するとき、スプライトのスケールを必ず等倍に戻す。

### Scenario: 他状態遷移時の等倍リセット

- **WHEN** プレーヤーが S1/S2 のジャンプチャージ中から他の状態（S3/S4/S5/S6/S7）に遷移する
- **THEN** `setScale(1.0, 1.0)` が呼ばれ、スプライトの X・Y スケールが両方 1.0 にリセットされる

---

## Requirement: チャージ中の Y 方向スケール縮小

プレーヤーがジャンプチャージ中、チャージ量に連動してスプライトを Y 方向に縮小し、同時に X 方向に拡大する。縮小はスプライト下端、拡大はスプライト中央を起点に行う。

### Scenario: チャージ開始時のスケール変化

- **WHEN** プレーヤーがジャンプチャージを開始する
- **THEN** チャージ量が 0% の時点では `scaleY = 1.0`、`scaleX = 1.0` のままである

### Scenario: チャージ最大時のスケール

- **WHEN** プレーヤーのチャージ量が 100% に達する
- **THEN** スプライトの `scaleY` は 0.7 となり（下端起点で 30% 縮小）、それ以上は縮小しない
- **AND** スプライトの `scaleX` は 1.2 となり（中央起点で 20% 拡大）、それ以上は拡大しない

### Scenario: チャージ量に連動したスケール

- **WHEN** プレーヤーのチャージ量が 0〜100% の間にある
- **THEN** `scaleY = 1.0 - 0.3 * chargeAmount` の計算式に従って Y スケールが設定される
- **AND** `scaleX = 1.0 + 0.2 * chargeAmount` の計算式に従って X スケールが設定される

### Scenario: ジャンプ発動後のスケールリセット

- **WHEN** プレーヤーがジャンプを発動する（チャージをリリースする）
- **THEN** `scaleY` と `scaleX` が両方 1.0 にリセットされる
