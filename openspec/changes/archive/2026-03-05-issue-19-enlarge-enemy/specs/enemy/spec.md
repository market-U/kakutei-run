# specs: issue-19-enlarge-enemy — enemy

## MODIFIED Requirements

### Requirement: 敵キャラクターの初期配置

敵キャラクターはゲーム開始時から画面左端にチラ見えする位置に存在し、プレーヤーと同じ速度で追跡する。

#### Scenario: 初期表示

- **WHEN** ゲームが開始される
- **THEN** 敵キャラクターが画面左端から少し（約60〜80px）だけ見える位置に配置される
- **AND** プレーヤーX座標が CANVAS_W/2 のため、敵の初期距離は CANVAS_W/2 にスプライト半幅を加えた値（約 CANVAS_W/2 - 20px 程度）に設定する

#### Scenario: 通常追跡

- **WHEN** プレーヤーが通常走行状態である
- **THEN** 敵キャラクターはプレーヤーと同じスクロール速度で移動し、距離は変化しない
