# Design: fix-swa-routing

## Context

Azure Static Web Apps（以下 SWA）にデプロイされたゲームが真っ黒画面のまま表示されない不具合が確認されている。ブラウザコンソールには以下のエラーが出ている。

```text
Failed to load module script: Expected a JavaScript-or-Wasm module script but
the server responded with a MIME type of "video/mp2t".
```

現状の `staticwebapp.config.json` は以下の `routes` エントリを持つ。

```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
```

`"route": "/*"` は SWA のルーティングエンジンで **静的ファイルより優先して** 評価されるため、`/assets/index-abc123.js` のようなビルド済みアセットへのリクエストも `index.html` を返してしまう。Vite のビルド出力は `<script type="module">` で `.ts` 拡張子のファイルを参照しており、SWA はその `.ts` を `video/mp2t`（MPEG2 トランスポートストリーム）として MIME 判定するため、ブラウザがモジュール読み込みを拒否する。

## Goals / Non-Goals

**Goals:**

- `/assets/` 以下の静的ファイルが正しい MIME タイプで配信される
- SPA のクライアントサイドルーティング（存在しないパスへのアクセス）は引き続き `index.html` にフォールバックされる
- `.js` ファイルが `application/javascript` として配信される

**Non-Goals:**

- Vite ビルド設定の変更
- ゲームロジックや画面仕様の変更
- 認証・API ルートの設定

## Decisions

### 決定 1: `routes` の `/*` エントリを削除し `navigationFallback` に一本化

**選択肢:**

| 案 | 内容 | 評価 |
|---|---|---|
| A | `routes` の `/*` エントリを削除 | ✅ シンプル。`navigationFallback` が SPA フォールバックを担う |
| B | `routes` に静的アセット除外パターンを追加 | ❌ パターン管理が煩雑。Vite のハッシュ付きファイル名と相性が悪い |

`navigationFallback` は SWA の公式推奨方式であり、静的ファイルには自動的に適用されないため、案 A を採用する。

### 決定 2: `navigationFallback` に `exclude` パターンを追加

SWA の `navigationFallback` はデフォルトでは `.`（拡張子あり）のパスを除外するが、明示的な `exclude` パターンを記載することで意図を明確にし、将来的な設定変更時の誤りを防ぐ。

- `/assets/*` — Vite ビルド済みアセット（JS/CSS/画像）
- `*.js`, `*.css`, `*.png`, `*.jpg`, `*.svg`, `*.wasm` — 拡張子ベースの除外

### 決定 3: `mimeTypes` に `.js` を追加

SWA のデフォルト MIME タイプマップは `.ts` を `video/mp2t` として扱う場合がある。Vite ビルド後の成果物は `.js` のみなので、`.js` → `application/javascript` を明示的に登録する。

## Risks / Trade-offs

| リスク | 対策 |
|---|---|
| `routes` 削除後に既存の SPA ルーティングが壊れる | `navigationFallback` が同等の機能を提供するため影響なし |
| `exclude` パターン漏れで新規アセット種別がフォールバックにヒットする | Vite の `assetsDir: "assets"` により全アセットは `/assets/` 配下に集約されるため `/assets/*` で網羅できる |

## Migration Plan

1. `staticwebapp.config.json` を修正する（`routes` 削除、`navigationFallback.exclude` 追加、`mimeTypes` 追加）
2. `feature/fix-swa-routing` ブランチで PR を作成し `develop` にマージする
3. GitHub Actions によって自動デプロイされ、プレビュー環境で動作確認する
4. `develop` → `main` にマージしてプロダクションへ反映する

**ロールバック:** `staticwebapp.config.json` の変更を revert するだけで元の状態に戻る。
