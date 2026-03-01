# Proposal: fix-swa-routing

## Why

デプロイ済み環境でゲームが真っ黒画面のままレンダリングされない。`staticwebapp.config.json` の `routes` 設定が `/` 以下のすべてのリクエスト（JS/CSS等の静的アセットを含む）を `index.html` で応答してしまい、Azure Static Web Apps がビルド済み JS ファイルを `video/mp2t` という誤った MIME タイプで返すためモジュールスクリプトの読み込みが失敗している。

## What Changes

- `staticwebapp.config.json` から有害な `routes` エントリ（`"route": "/*"` → `"serve": "/index.html"`）を削除する
- `navigationFallback` に静的アセットの除外パターンを追加し、JS/CSS/画像等のファイルリクエストが正しいファイルとして返されるようにする
- `mimeTypes` に `.js` の明示的なエントリを追加し、JavaScript モジュールが正しい MIME タイプ（`application/javascript`）で配信されることを保証する

## Capabilities

### New Capabilities

- `deployment`: Azure Static Web Apps の静的アセット配信・ルーティング・MIME タイプ設定要件

### Modified Capabilities

（なし）

## Impact

- `staticwebapp.config.json` のみ変更
- ゲームロジック・アセット・シーンへの影響はなし
- デプロイ後の本番環境でゲームが正常に起動するようになる
