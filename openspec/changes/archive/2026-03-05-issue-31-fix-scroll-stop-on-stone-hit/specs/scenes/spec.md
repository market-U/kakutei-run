# Spec delta: scenes

## ADDED Requirements

### Requirement: 腰痛スロー中の石ころ被弾による転倒

プレーヤーが腰痛スロー状態（`back_pain_slow`）中に石ころへ衝突した場合、通常走行中と同様に転倒シーケンスが起動しなければならない（SHALL）。

#### Scenario: 腰痛スロー中に石ころへ衝突

- **WHEN** ゲームシーンの状態が `back_pain_slow` のときプレーヤーが石ころに衝突する
- **THEN** `player_fall` アニメーションが再生される
- **AND** ゲームシーンの状態が `stone_fall_coasting` に遷移する
- **AND** 腰痛スロータイマーがキャンセルされる

#### Scenario: 腰痛スロー中転倒後のスクロール停止

- **WHEN** `back_pain_slow` 中の石ころ被弾により `stone_fall_coasting` に遷移した後、`player_fall` アニメーションが完了する
- **THEN** スクロールが停止する
- **AND** ゲームシーンの状態が `stone_fall` に遷移する
- **AND** 敵の追跡が開始される

#### Scenario: 腰痛スロー中転倒後のスクロール速度

- **WHEN** `back_pain_slow` 中の石ころ被弾により `stone_fall_coasting` に遷移する
- **THEN** `stone_fall_coasting` 中のスクロール速度は被弾直前の slowed speed のまま変更されない

### Requirement: 最大スクロール距離超過によるゲーム強制終了

状態遷移の考慮漏れ等により異常にスクロールが継続した場合、ゲームは最大スクロール距離を超えた時点で強制的にゲームオーバーとして終了しなければならない（SHALL）。

#### Scenario: 最大スクロール距離を超過した場合の強制終了

- **WHEN** `scrolledX` が `difficulty.stageLength + 500` を超過する
- **THEN** スクロールが停止する
- **AND** ゲームシーンの状態が `game_over` に遷移する
- **AND** 2 秒後に `result: "gameover"` で `ResultScene` へ遷移する

#### Scenario: 正常なゴール到達時の誤発動防止

- **WHEN** プレーヤーが正常にゴール（税務署）に到達してクリアシーケンスに入る
- **THEN** 最大スクロール距離チェックは発動せず、クリアシーケンスが継続される
