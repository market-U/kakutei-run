# design: SEO / OGP / ファビコン対策

## Context

現在の `index.html` の `<head>` には `<title>確定申告ラン</title>` のみで、検索エンジン向けの description・SNS プレビュー用 OGP・ファビコンが未設定。
プロジェクトは Vite + TypeScript + Phaser の静的 SPA であり、サーバーサイドレンダリングは行っていない。

## Goals / Non-Goals

**Goals:**

- `index.html` の `<head>` にメタタグ・ファビコンを追加する
- 検索エンジン・SNS（X / Discord 等）で正しいタイトル・説明・サムネが表示される状態にする

**Non-Goals:**

- 動的 OGP（ページごとに異なるメタ情報を生成する仕組み）
- ICO 形式のファビコン生成（PNG のみで対応）
- サーバーサイドレンダリングの導入

## Decisions

### 静的 HTML に直接書く

Vite の単一 `index.html` にすべてのメタタグを記述する。
ゲームはシングルページであり、ページ遷移による動的 OGP は不要なため、最もシンプルな実装を選択する。

### Twitter Card は `summary_large_image` タイプを使用

OGP 画像（1200×630px）が横長サムネとして X 上で大きく表示されるため、視認性の高い `summary_large_image` を採用する。

### ファビコンは PNG 1 種類で対応

モダンブラウザは PNG ファビコンを標準サポートしているため、ICO 変換は行わない。
`<link rel="icon" href="/favicon.png" type="image/png">` のみ追加する。

### OGP 画像の URL はルート相対パスで指定

`og:image` には絶対 URL が推奨されるが、デプロイ先 URL が確定している `https://kakutei-run.vercel.app`（または本番 URL）を使用する。

## Risks / Trade-offs

- **[Risk] OGP 画像の URL が変わった場合**: SNS のキャッシュが残るため、シェアされたリンクのサムネが更新されないことがある → 初回シェア前に正しい URL を設定する
- **[Risk] OGP 画像・ファビコンがユーザー準備待ち**: 実装はコードのみ先行できるが、画像がないと確認できない → 画像のプレースホルダーとして既存アセットをいったん参照してもよい
