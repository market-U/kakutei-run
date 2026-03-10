# proposal: SEO / OGP / ファビコン対策

## Why

確定RUN が検索エンジンや SNS でシェアされたとき、タイトル・説明文・サムネイルが未設定のため、意図しない表示になる可能性がある。
ゲームの認知度向上・シェア促進のために、検索エンジン向けメタ情報・SNS プレビュー（OGP）・ファビコンを整備する。

## What Changes

- `<title>` を `確定申告ラン` から `確定RUN | 確定申告応援ゲーム` へ変更
- `<meta name="description">` を追加（検索エンジン向け説明文）
- OGP タグを追加（`og:title` / `og:description` / `og:image` / `og:url` / `og:type`）
- Twitter Card タグを追加（`twitter:card` / `twitter:title` / `twitter:description` / `twitter:image`）
- ファビコン（`<link rel="icon">`）を追加
- OGP 用画像ファイル `public/ogp.png`（1200×630px）を配置（ユーザーが用意）
- ファビコン用画像ファイル `public/favicon.png`（512×512px）を配置（ユーザーが用意）

## Capabilities

### New Capabilities

- `seo-ogp-favicon`: ブラウザタイトル・検索エンジン向け description・SNS プレビュー用 OGP・ファビコンを `index.html` に実装する

### Modified Capabilities

（なし）

## Impact

- `index.html` の `<head>` セクションのみ変更
- `public/` に画像ファイルを 2 点追加（ユーザーが別途用意）
- 既存のゲームロジック・スタイル・スクリプトへの影響なし
