# Design: HUD レイアウト改善

## Context

現在の HUD は `position: fixed; top: 0; left: 0; right: 0` で画面上端に固定された単一のバーとして実装されている。Phaser キャンバスは `Scale.FIT` で 960×540 を画面にフィットさせるため、縦画面ではキャンバスの上に大きな余白が生まれる。この余白により HUD とゲームキャンバスの距離が離れ、視認性が低下している。

ポーズボタン・コメントトグルボタンも `position: fixed; top: 2; right: 2` で独立配置されており、HUD の受け入れエリアと視覚的に分離している。

## Goals / Non-Goals

**Goals:**

- HUD の情報（レシート数・距離）をキャンバス上端に隣接して表示する
- ポーズ・コメントボタンをキャンバス上端右に移動する
- キャンバス下部の余白に操作方法テキストを追加する
- 縦画面・横画面で自然に切り替わる（横画面では下部テキストが自動的に非表示）

**Non-Goals:**

- ゲームロジック・スコアリング・シーン遷移への変更
- コメント流下システムの変更
- タイトル・リザルト画面のレイアウト変更

## Decisions

### Decision 1: ResizeObserver によるキャンバス位置追跡

**採用**: `ResizeObserver` でキャンバス要素を監視し、`getBoundingClientRect()` で実際の描画位置を取得。CSS変数 `--canvas-top` と `--canvas-height` を `document.documentElement.style.setProperty` で更新する。

**理由**: Phaser の `Scale.FIT` はデバイス・向き・ブラウザにより異なるサイズに収束するため、CSS の aspect-ratio 計算よりも実測値を使う方が確実。`ResizeObserver` は canvas のサイズ変化（端末回転・リサイズ）に自動追従する。

**代替案**: CSS `aspect-ratio: 960/540` でキャンバスと同じサイズの div を生成する純CSS方式。
→ CSS変数の計算が複雑になる上、ブラウザのレンダリングタイミングによってズレが生じる可能性があるため不採用。

### Decision 2: HUD の3段 Flex 構成

```
┌─────────────────────────────┐
│  hud-top (height: --canvas-top)  │  スペーサー（コンテンツなし）
├─────────────────────────────┤
│  hud-middle (height: --canvas-height) │  レシート・距離・ボタン
├─────────────────────────────┤
│  hud-bottom (flex: 1)       │  操作方法テキスト
└─────────────────────────────┘
```

`hud-top` は純粋なスペーサーとして機能し、`hud-middle` がキャンバスと同じ高さ・位置を占める。横画面では `--canvas-top ≈ 0` になるため `hud-top` が消え、`hud-bottom` も `flex: 1` で残余スペースを取るが実質 0px となり自然に非表示になる。

### Decision 3: 横画面での操作テキスト表示位置

横画面では `hud-bottom` が消えるため、操作テキストは `hud-middle` の下端（`items-end` 配置）にも表示する。地面グラフィック・コメントとの重なりは許容し、テキストに半透明背景バッジを付けて視認性を確保する。

### Decision 4: ResizeObserver の配置場所

`HUD.ts` のコンストラクタ内でキャンバス要素を取得して `ResizeObserver` を登録し、`destroy()` 時に `disconnect()` する。HUD が生存している間のみ監視を行う。

**代替案**: `main.ts` でグローバルに管理する。
→ HUD のライフサイクルに合わせて管理する方が責務が明確なため `HUD.ts` に配置する。

## Risks / Trade-offs

- **コメントとの重なり（横画面）**: 横画面での操作テキストはコメント最下レーン（Y=475）と重なる可能性がある。半透明背景バッジで軽減するが、コメントが多い時に見づらくなる可能性がある。→ 実装後に実機確認し、必要であれば横画面での表示を無効化する CSS クラス切り替えで対応する。
- **ResizeObserver の初回発火タイミング**: Phaser の初期化完了前に `HUD` が生成された場合、キャンバス要素が存在しないか未スケールの可能性がある。→ `querySelector('canvas')` が `null` の場合は CSS変数をフォールバック値（top: 0 / height: 100%）で初期化し、Observer はキャンバス要素取得後に登録する。

## Open Questions

なし（横画面での操作テキスト重なりは実装後に確認）
