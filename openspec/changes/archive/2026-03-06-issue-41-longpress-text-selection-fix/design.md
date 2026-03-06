# Design: issue-41-longpress-text-selection-fix

## Context

現状、`src/style.css` で `#game-container canvas` に対して `touch-action: none` / `user-select: none` を適用しているが、Phaser キャンバスの上に重ねた HTML UI オーバーレイ（HUD・タイトル画面・リザルト画面・ポーズオーバーレイ）には未適用。スマホでジャンプチャージのロングタップを行うと、これらの HTML 要素上のテキストが選択されたり、iOS Safari の「コピー / 選択」コンテキストメニューが表示される。

## Goals / Non-Goals

**Goals:**

- HTML UI オーバーレイ全体でテキスト選択を禁止する
- iOS Safari のロングタップコンテキストメニューを抑制する
- 変更を最小限に留め、style.css のみで解決する

**Non-Goals:**

- Phaser キャンバス内のタッチ制御変更（既に対応済み）
- `contextmenu` イベントの JS ハンドラによる抑制（CSS で十分）
- PC ブラウザでのコンテキストメニュー抑制（スマホ限定の問題）

## Decisions

### `body` 全体に `user-select: none` を適用する

**決定**: `#hud-overlay` や `#title-screen` など個別要素ではなく、`body` に一括適用する。

**理由**:
- 対象要素は今後も増える可能性があり、個別指定では漏れが生じやすい
- ゲームアプリとして、ページ全体でテキスト選択が不要
- Tailwind CSS は `user-select` ユーティリティを持つが、`@layer base` への追加より明示的な `body` ルールの方がシンプル

**代替案**: 各オーバーレイ要素に個別クラスを付与 → メンテコストが増えるため却下

### `-webkit-touch-callout: none` を `body` に追加する

**決定**: iOS Safari 固有のロングタップコールアウト（画像保存・テキスト選択メニュー）を無効化する。

**理由**: `user-select: none` のみでは iOS Safari の「コピー」メニューが出る場合があり、`-webkit-touch-callout: none` の併用で確実に抑制できる。

## Risks / Trade-offs

- `user-select: none` をページ全体に適用すると、将来的にコピー可能にしたいテキスト（エラーコード等）で個別の `user-select: text` 上書きが必要になる → ゲームアプリとして現状ほぼ不要な機能のため許容

## Migration Plan

1. `src/style.css` の `body` ルールに `user-select: none` / `-webkit-user-select: none` / `-webkit-touch-callout: none` を追加
2. 開発サーバーでスマホ実機またはブラウザ DevTools の Touch Simulation で動作確認
3. コミット・PR マージ
