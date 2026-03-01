# Tasks: fix-swa-routing

## 1. staticwebapp.config.json の修正

- [x] 1.1 `routes` セクションの `"route": "/*"` → `"serve": "/index.html"` エントリを削除する
- [x] 1.2 `navigationFallback` に `exclude` パターン（`["/assets/*"]`）を追加する
- [x] 1.3 `mimeTypes` に `".js": "application/javascript"` を追加する

## 2. 動作確認

- [x] 2.1 ローカルで `npm run build` を実行し、`dist/` に正常なビルド成果物が生成されることを確認する
- [ ] 2.2 `feature/fix-swa-routing` を push して Azure SWA のプレビュー環境へデプロイされることを確認する
- [ ] 2.3 デプロイ後の URL でゲームが正常に起動し、黒画面エラーが解消されていることを確認する
- [ ] 2.4 ブラウザコンソールに MIME タイプエラーが出ていないことを確認する
