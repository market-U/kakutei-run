# Spec: scenes（delta）

## ADDED Requirements

### Requirement: Enemy の描画順（depth）

Enemy はプレーヤーより手前に描画されなければならない（SHALL）。

#### Scenario: Enemy とプレーヤーの重なり時の表示

- **WHEN** Enemy とプレーヤーが画面上で重なる
- **THEN** Enemy がプレーヤーよりも手前に表示される

#### Scenario: Enemy の depth 定義

- **WHEN** ゲームシーンが描画される
- **THEN** Enemy の depth は Player の depth より大きくなければならない（SHALL）
- **AND** Enemy の depth は 11 とする（Player は 10 のまま変更なし）

### Requirement: Enemy の矩形オーバーラップ衝突判定

Enemy（追跡キャラ）がプレーヤーに到達したかの判定は、X 座標の閾値ではなく Player と Enemy のスプライト矩形同士の AABB 交差判定で行わなければならない（SHALL）。

#### Scenario: Enemy がプレーヤーに接触

- **WHEN** 追跡中の Enemy のヒットボックス矩形と Player のスプライト矩形が重なる
- **THEN** `enemyReached` イベントが発火する

#### Scenario: Enemy がプレーヤーに接触していない

- **WHEN** 追跡中の Enemy のヒットボックス矩形と Player のスプライト矩形が重なっていない
- **THEN** `enemyReached` イベントは発火しない

#### Scenario: Enemy のヒットボックスサイズ

- **WHEN** Enemy の `getHitBounds()` が呼ばれる
- **THEN** `displayWidth * 0.8` × `displayHeight * 0.8` の矩形が返される
