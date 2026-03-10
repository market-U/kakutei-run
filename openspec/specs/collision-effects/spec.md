# Spec: collision-effects

## Requirement: レシート取得エフェクト

レシートを取得したとき、衝突地点に "+1" テキストが出現し、スクロールに追従しながら上昇しつつフェードアウトする。

### Scenario: レシート取得時にエフェクトが発生する

- **WHEN** Player が Receipt に衝突する
- **THEN** 衝突地点の画面座標に "+1" テキストが表示される
- **THEN** テキストは Elastic.Out でスケールアニメーションしながら出現する
- **THEN** テキストは上昇しながらフェードアウトして消える
- **THEN** テキストはゲームのスクロールに追従して左へ移動する

### Scenario: アニメーション完了後に破棄される

- **WHEN** エフェクトテキストのアニメーションが最後まで完了する
- **THEN** テキストオブジェクトは `destroy()` され、`activeEffects` から除去される

### Scenario: シーン切り替えで tween が中断されても破棄される

- **WHEN** エフェクトアニメーション進行中に GameScene が SHUTDOWN される
- **THEN** `EffectManager.destroy()` によってすべてのアクティブエフェクトが破棄される
- **AND** GPU・メモリ上にテキストオブジェクトが残存しない

---

## Requirement: ゴール到達エフェクト

ゴール到達時に「確定！！」テキストが Elastic.Out スケールアニメーションで出現する。

### Scenario: ゴール到達時にテキストがボヨヨ〜ンと表示される

- **WHEN** Player がゴール地点に到達する
- **THEN** 「確定！！」テキストがスケール 0 から始まり Elastic.Out で弾みながら通常サイズになる
- **THEN** テキストはスクロールに追従せず画面固定位置に表示される
- **THEN** テキストはフェードアウトせずそのまま表示され続ける

---

## Requirement: Enemy 到達エフェクト

Enemy がプレーヤーに到達したとき、複数のテキストからランダムに選択されたメッセージが画面上に表示される。

### Scenario: Enemy 到達時にランダムメッセージが表示される

- **WHEN** Enemy がプレーヤーへの到達距離ゼロになる
- **THEN** 定義済みの複数テキストからランダムに1つが選ばれ画面上に表示される
- **THEN** テキストは上昇しながらフェードアウトして消える
- **THEN** テキストはスクロールに追従しない

### Scenario: エフェクトが完了後に破棄される

- **WHEN** Enemy 到達テキストのアニメーションが完了する
- **THEN** テキストオブジェクトは画面から削除されメモリが解放される

---

## Requirement: EffectManager のシーン SHUTDOWN 時の一括破棄

`EffectManager` は `destroy()` メソッドを持たなければならない（SHALL）。
`destroy()` 呼び出し時は `activeEffects` リストのすべてのテキストオブジェクトを `destroy()` し、`activeEffects` を空にしなければならない（SHALL）。

GameScene は SHUTDOWN 時に `effectManager.destroy()` を呼ばなければならない（SHALL）。

### Scenario: シーン SHUTDOWN 時にエフェクトが一括破棄される

- **WHEN** GameScene の `SHUTDOWN` イベントが発火する
- **THEN** `EffectManager.destroy()` が呼ばれる
- **AND** アクティブなすべてのエフェクトテキストオブジェクトが破棄される
- **AND** `activeEffects` リストが空になる

### Scenario: リトライ後に前セッションのエフェクトが残存しない

- **WHEN** ゲームオーバー後にリトライする
- **THEN** 前のゲームセッションのエフェクトテキストオブジェクトは破棄済みである
