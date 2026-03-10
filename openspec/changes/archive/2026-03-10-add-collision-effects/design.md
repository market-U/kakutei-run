## Context

現状、レシート取得・ゴール到達・Enemy 到達のいずれのイベントも視覚的なフィードバックがない（ゴール時は「確定！！」テキストが静止表示されるのみ）。Phaser 3 の Tween / Text API を活用し、エフェクトを一元管理する `EffectManager` を導入する。

ゲームはカメラを使わず `scrolledX` の差分をオブジェクトの `x` に手動適用するスクロール方式のため、スクロール追従エフェクトは毎フレーム `x` を補正する必要がある。

## Goals / Non-Goals

**Goals:**
- `EffectManager` で浮き上がりテキストエフェクトを生成・更新・破棄する
- レシート取得エフェクト: 衝突地点でスクロール追従しながら上昇＋フェードアウト
- ゴール到達エフェクト: 既存「確定！！」テキストに Elastic.Out スケールアニメーションを追加
- Enemy 到達エフェクト: 画面固定位置でランダムメッセージを上昇＋フェードアウト
- 各エフェクトのパラメータ（フォントサイズ・アニメーション時間・イージング等）を個別に調整可能にする

**Non-Goals:**
- Witch 衝突エフェクト（将来対応）
- 画像アセットを使ったエフェクト（将来の差し替え先として設計するが今回は Text のみ）
- Stone 衝突エフェクト

## Decisions

### EffectManager クラスを新設する

`src/systems/EffectManager.ts` を新規作成し、GameScene から使用する。

**理由**: エフェクトロジックを GameScene に直書きすると肥大化する。また、スクロール追従の更新処理を毎フレーム呼ぶ必要があるため、update() を持つ Manager クラスが適切。

### Phaser Text + Tween を使用する（アセット画像は使わない）

フォント・色・アウトラインはコードで指定し、アセット準備コストをゼロにする。見た目が不満であれば後から Image に差し替えられる設計にする。

**理由**: 反復的な調整サイクルを素早く回せるため。

### スクロール追従は EffectManager.update(scrollDelta) で実現する

```
GameScene.update()
  ↓
scrollManager から速度・delta を取得して scrolledX を更新
  ↓
effectManager.update(scrollDelta)  // 前フレームからの差分 px を渡す
  ↓
followScroll=true のエフェクトの x を -= scrollDelta で補正
```

**理由**: Phaser カメラを使わない既存設計と整合する。Tween が y と alpha を動かし、Manager が x を補正することで両者が干渉しない。

### ゴールエフェクトは showClearEffect() 内で Text 生成直後に Tween を付与する

`EffectManager` を経由せず、GameScene の `showClearEffect()` 内で完結させる。ゴールテキストはスクロール追従不要・フェードなし・消去不要で、エフェクト管理の複雑さを持ち込む必要がない。

**代替案**: EffectManager に goalEffect メソッドを作る → オーバーエンジニアリングになるため不採用。

### Enemy 到達テキストはランダム選択する

`GameScene` 内の配列定数からランダムに選ぶ。テキスト内容は将来変更しやすいよう定数として切り出す。

## Risks / Trade-offs

- **Tween と手動 x 補正の競合**: Tween が x を動かしつつ Manager も x を補正すると矛盾が生じる。→ Tween では x を動かさず、y / alpha / scale のみを対象にすることで回避する。
- **エフェクトの大量生成**: レシートを高速連続取得すると多数の Text オブジェクトが生成される。→ Tween 完了時に `destroy()` を呼んで確実に破棄する。
- **フォント未ロード時の見た目**: Web フォントが遅延ロードされると初回表示が崩れる可能性がある。→ sans-serif フォールバックを使用するため実用上問題ない。

## Open Questions

- Enemy 到達テキストの表示位置（画面中央？プレーヤー付近？）は実装後に動作を見て決める
