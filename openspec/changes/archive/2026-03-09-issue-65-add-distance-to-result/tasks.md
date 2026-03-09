# Tasks: Result画面のシェア情報にdistanceを追加する

## 1. GameScene のイベント payload に distance を追加

- [x] 1.1 `src/scenes/GameScene.ts` の `onEnemyCaught`・`onScrollOverrun`・`onGoalReached` それぞれの `kakutei:gameResult` 発火箇所に `distance: Math.floor(this.scrolledX / 10)` を追加する

## 2. ResultUI の型・データフローを更新

- [x] 2.1 `src/ui/ResultUI.ts` の `ResultDetail` インターフェースに `distance: number` フィールドを追加する
- [x] 2.2 `show` メソッドのデストラクチャリングに `distance` を追加し、`generateShareImage` へ渡す
- [x] 2.3 `generateShareImage` のシグネチャに `distance: number` を追加し、Canvas 画像に走行距離を描画する（配置・スタイルは開発者にて調整）

## 3. Result 画面 HTML への走行距離表示（開発者にて実施）

- [x] 3.1 `index.html` の Result 画面に走行距離表示用の HTML 要素を追加する
- [x] 3.2 `src/ui/ResultUI.ts` の `show` メソッドで走行距離要素にテキストをセットする
- [x] 3.3 走行距離要素のスタイル（CSS）を調整する
