# Tasks: fix-swa-routing

## 1. staticwebapp.config.json の修正

- [x] 1.1 `routes` セクションの `"route": "/*"` → `"serve": "/index.html"` エントリを削除する
- [x] 1.2 `navigationFallback` に `exclude` パターン（`["/assets/*"]`）を追加する
- [x] 1.3 `mimeTypes` に `".js": "application/javascript"` を追加する

## 2. デプロイ設定の修正（根本原因対応）

- [x] 2.1 `staticwebapp.config.json` を `public/` に移動する（Vite が `dist/` に自動コピー）
- [x] 2.2 ワークフローの `app_location` を `"dist"`、`output_location` を `""` に変更する（`skip_app_build: true` 時の正しい設定）

## 3. 動作確認

- [x] 3.1 ローカルで `npm run build` を実行し、`dist/staticwebapp.config.json` が生成されることを確認する
- [ ] 3.2 `feature/fix-swa-routing` の PR でプレビュー環境にデプロイされることを確認する
- [ ] 3.3 デプロイ後の URL でゲームが正常に起動し、黒画面エラーが解消されていることを確認する
- [ ] 3.4 ブラウザコンソールに MIME タイプエラーが出ていないことを確認する
