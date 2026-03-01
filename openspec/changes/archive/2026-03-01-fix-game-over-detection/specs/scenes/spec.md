## MODIFIED Requirements

### Requirement: Enemy の矩形オーバーラップ衝突判定

Enemy（追跡キャラ）がプレーヤーに到達したかの判定は、X 座標の閾値ではなく Player と Enemy のスプライト矩形同士の AABB 交差判定で行わなければならない（SHALL）。魔女被弾回数がいかなる値であっても、それ単独でゲームオーバーを発火させてはならない（SHALL NOT）。

#### Scenario: Enemy がプレーヤーに接触

- **WHEN** 追跡中の Enemy のヒットボックス矩形と Player のスプライト矩形が重なる
- **THEN** `enemyReached` イベントが発火する

#### Scenario: Enemy がプレーヤーに接触していない

- **WHEN** 追跡中の Enemy のヒットボックス矩形と Player のスプライト矩形が重なっていない
- **THEN** `enemyReached` イベントは発火しない

#### Scenario: Enemy のヒットボックスサイズ

- **WHEN** Enemy の `getHitBounds()` が呼ばれる
- **THEN** `displayWidth * 0.8` × `displayHeight * 0.8` の矩形が返される

#### Scenario: 魔女3回被弾時のゲームオーバー非即発

- **WHEN** プレーヤーが3回目の魔女に接触する
- **THEN** 腰痛スロー状態が適用され、ゲームオーバーは発火しない
- **AND** Enemy が Player の矩形に重なった時点で初めてゲームオーバーになる

#### Scenario: 魔女被弾回数によるゲームオーバー直結の禁止

- **WHEN** プレーヤーが魔女に何回接触しても
- **THEN** 魔女被弾回数（hitCount）だけを根拠に `enemyReached` イベントまたはゲームオーバーシーケンスを発火させてはならない（SHALL NOT）


