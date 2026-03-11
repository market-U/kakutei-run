## 1. 実装

- [x] 1.1 `PlayerStateManager.activateBackPain()` に `_falling` ガードを追加する（`if (this._gameOver || this._falling) return "none";`）

## 2. テスト

- [x] 2.1 既存の `PlayerStateManager` ユニットテストがすべて通ることを確認する
- [x] 2.2 `activateBackPain()` を `_falling=true` の状態で呼び出すと `"none"` が返ることを確認するユニットテストを追加する
- [x] 2.3 石ころと魔女を同一 worldX に意図的に配置して手動再現テストを実施し、`player_fall` アニメーションが中断されずゲームオーバーシーケンスへ正常移行することを確認する
