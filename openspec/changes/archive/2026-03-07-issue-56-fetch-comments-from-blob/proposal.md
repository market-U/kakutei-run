# Proposal: comments.json を Azure Blob Storage から取得する

## Why

現在 `comments.json` はアプリにバンドルされた静的ファイルとして配信されているが、コメントの追加・更新のたびに再デプロイが必要になる。
Azure Blob Storage のパブリックエンドポイントから取得することで、デプロイなしでコメントを更新できるようにする。

## What Changes

- `CommentManager.load()` の fetch 先を `/comments.json`（バンドル）から Azure Blob Storage のパブリック URL（`VITE_COMMENTS_URL` 環境変数）に変更する
- コメント取得タイミングをゲーム開始時からタイトル画面表示時に移動する
- fetch にタイムアウト（1回あたり5秒）とリトライ（最大3回）を追加する
- fetch 失敗時はバンドル済み `public/comments.json` へフォールバックする
- タイトル画面のローディング UI を追加し、fetch 完了まで難易度ボタンを無効化する

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `niconico-comments`: コメントデータの取得元・取得タイミング・リトライ仕様・ローディング UX の要件が変わる

## Impact

- `src/systems/CommentManager.ts`：fetch ロジック（URL・タイムアウト・リトライ・フォールバック）の修正
- `src/ui/TitleUI.ts`：タイトル画面表示時に fetch を呼び出す処理・ローディング表示の追加
- `src/ui/DifficultyButtons.ts`：fetch 完了まで難易度ボタンを disabled にする制御の追加
- `src/scenes/GameScene.ts`：`CommentManager.load()` 呼び出しの削除（取得済みデータを使うだけにする）
- `.env.example`：`VITE_COMMENTS_URL` の追記
- `public/comments.json`：フォールバック用として引き続き保持
