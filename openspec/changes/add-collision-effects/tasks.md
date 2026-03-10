## 1. EffectManager の実装

- [x] 1.1 `src/systems/EffectManager.ts` を新規作成し、`spawnFloatingText({ x, y, text, followScroll })` メソッドを実装する
- [x] 1.2 `update(scrollDelta: number)` メソッドを実装し、`followScroll=true` のエフェクトの x 座標をフレームごとに補正する
- [x] 1.3 Tween 完了コールバックでテキストオブジェクトを `destroy()` し、activeEffects リストから除去する

## 2. GameScene への組み込み

- [x] 2.1 `GameScene` に `EffectManager` をフィールドとして追加し、`create()` で初期化する
- [x] 2.2 `update()` 内で `scrollDelta` を計算して `effectManager.update(scrollDelta)` を呼び出す

## 3. レシート取得エフェクト

- [x] 3.1 レシート衝突時のコールバック（`onReceiptCollected` 相当の箇所）で `effectManager.spawnFloatingText` を呼び出す（`followScroll: true`）
- [x] 3.2 エフェクトのアニメーションパラメータ（Elastic.Out スケール・上昇量・フェード時間）を調整する

## 4. ゴール到達エフェクト

- [x] 4.1 `showClearEffect()` 内の「確定！！」テキスト生成直後に Elastic.Out スケール Tween を追加する

## 5. Enemy 到達エフェクト

- [x] 5.1 Enemy 到達テキストの配列定数を定義する（初期値: "申告は正確に" / "3月15日です" / "追徴課税です"）
- [x] 5.2 Enemy 到達時のコールバック（`onEnemyReached` 相当の箇所）で `effectManager.spawnFloatingText` を呼び出す（`followScroll: false`、テキストはランダム選択）
