# Tasks: HUD レイアウト改善

## 1. index.html の DOM 構造を3段構成に変更

- [x] 1.1 `hud-overlay` を `fixed inset-0 flex flex-col pointer-events-none z-10` の3段 Flex コンテナに変更する
- [x] 1.2 `hud-top`（スペーサー、`height: var(--canvas-top)`）を追加する
- [x] 1.3 `hud-middle`（`height: var(--canvas-height)`、レシート・距離・ボタンを含む）を追加する
- [x] 1.4 `hud-bottom`（`flex: 1 overflow-hidden`、操作方法テキストを含む）を追加する
- [x] 1.5 ポーズボタン・コメントトグルボタンを `fixed top-2 right-2` から `hud-middle` 上部右に移動する

## 2. HUD.ts に ResizeObserver を追加

- [x] 2.1 コンストラクタで `document.querySelector('canvas')` を取得し、キャンバス未取得時のフォールバック値（`--canvas-top: 0px` / `--canvas-height: 100%`）を設定する
- [x] 2.2 `ResizeObserver` を生成し、コールバック内で `getBoundingClientRect()` から `--canvas-top` と `--canvas-height` を `document.documentElement.style.setProperty` で更新する
- [x] 2.3 `observer.observe(canvas)` でキャンバス要素の監視を開始する
- [x] 2.4 `destroy()` に `observer.disconnect()` を追加して監視を解除する

## 3. 操作方法テキストの追加

- [x] 3.1 操作方法・ルールの1文テキストを `hud-bottom` に追加する（半透明背景バッジスタイル）
- [x] 3.2 横画面用に同テキストを `hud-middle` の下端にも追加し、`landscape:` Tailwind バリアントで縦画面時は非表示にする
