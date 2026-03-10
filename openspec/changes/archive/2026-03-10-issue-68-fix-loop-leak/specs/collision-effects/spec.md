# Spec: collision-effects (delta)

## ADDED Requirements

### Requirement: EffectManager のシーン SHUTDOWN 時の一括破棄

`EffectManager` は `destroy()` メソッドを持たなければならない（SHALL）。
`destroy()` 呼び出し時は `activeEffects` リストのすべてのテキストオブジェクトを `destroy()` し、`activeEffects` を空にしなければならない（SHALL）。

GameScene は SHUTDOWN 時に `effectManager.destroy()` を呼ばなければならない（SHALL）。

#### Scenario: シーン SHUTDOWN 時にエフェクトが一括破棄される

- **WHEN** GameScene の `SHUTDOWN` イベントが発火する
- **THEN** `EffectManager.destroy()` が呼ばれる
- **AND** アクティブなすべてのエフェクトテキストオブジェクトが破棄される
- **AND** `activeEffects` リストが空になる

#### Scenario: リトライ後に前セッションのエフェクトが残存しない

- **WHEN** ゲームオーバー後にリトライする
- **THEN** 前のゲームセッションのエフェクトテキストオブジェクトは破棄済みである

## MODIFIED Requirements

### Requirement: エフェクトが完了後に破棄される

エフェクト（レシート取得・Enemy 到達）のアニメーションが完了した際、またはシーンが SHUTDOWN された際に、テキストオブジェクトは破棄されメモリが解放されなければならない（SHALL）。
アニメーション完了による破棄は `onComplete` コールバックで行うが、シーン切り替えにより `onComplete` が呼ばれない場合は `EffectManager.destroy()` が確実に破棄を行う。

#### Scenario: アニメーション完了後に破棄される

- **WHEN** エフェクトテキストのアニメーションが最後まで完了する
- **THEN** テキストオブジェクトは `destroy()` され、`activeEffects` から除去される

#### Scenario: シーン切り替えで tween が中断されても破棄される

- **WHEN** エフェクトアニメーション進行中に GameScene が SHUTDOWN される
- **THEN** `EffectManager.destroy()` によってすべてのアクティブエフェクトが破棄される
- **AND** GPU・メモリ上にテキストオブジェクトが残存しない
