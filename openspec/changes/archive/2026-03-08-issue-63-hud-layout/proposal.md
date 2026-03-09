# Proposal: HUD レイアウト改善

## Why

縦画面時、HUD（レシート数・距離）がゲームキャンバスの上端に固定されているため、キャンバスとの距離が大きく開き視認性が悪い。またキャンバスの下側スペースが未活用であり、操作方法などの追加情報を表示する場所がない。

## What Changes

- HUD オーバーレイを3段構成（上スペーサー・中段・下段）のFlexコンテナに再設計する
- キャンバスの実際の表示位置を `ResizeObserver` で追跡し、CSS変数（`--canvas-top` / `--canvas-height`）でHUDに反映する
- レシート数・距離表示をキャンバス上端（`hud-middle` 上部左）に移動する
- ポーズボタン・コメントトグルボタンを `hud-middle` 上部右に移動する（現在は画面右上固定）
- キャンバス下段（`hud-bottom`）に操作方法・ルールの1文テキストを追加する
  - 縦画面：`hud-bottom`（キャンバス下の余白）に表示
  - 横画面：`hud-middle` 下端に表示（地面グラフィックと重なるが許容）

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `html-ui`: HUD の配置要件を変更。キャンバス上端固定から3段FlexレイアウトによるキャンバスFIT配置へ。ポーズ・コメントボタンも `hud-middle` 右上に移動。操作方法テキストをHUD下段に追加。

## Impact

- `index.html`: HUD オーバーレイのDOM構造を3段構成に変更。ポーズ・コメントボタンの配置変更。
- `src/ui/HUD.ts`: `ResizeObserver` でキャンバスサイズを監視し、CSS変数を更新するロジックを追加。
- `src/style.css`: HUDレイアウト用のCSS変数定義・3段FlexスタイルをTailwind補完として追加（必要な場合）。
