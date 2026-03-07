# Tasks: comments.json を Azure Blob Storage から取得する

## 1. CommentManager の fetch ロジック修正

- [ ] 1.1 `load()` メソッドの引数を `url` から削除し、`VITE_COMMENTS_URL` を参照するよう変更する
- [ ] 1.2 `AbortController` を使った 5 秒タイムアウト付き fetch ヘルパー関数を追加する
- [ ] 1.3 最大 3 回リトライするループを実装する（失敗時は即リトライ）
- [ ] 1.4 3 回すべて失敗した場合に `/comments.json`（バンドル済み）へフォールバックする処理を追加する
- [ ] 1.5 `VITE_COMMENTS_URL` が未設定の場合はバンドル済み `/comments.json` を直接 fetch するよう分岐を追加する
- [ ] 1.6 `window.__commentsData` へキャッシュを保存・参照するロジックを追加する（`CommentsData | null` 型宣言含む）

## 2. TitleUI のロード制御追加

- [ ] 2.1 `kakutei:assetsLoaded` イベントのハンドラ内で fetch を呼び出す
- [ ] 2.2 fetch 開始時に DaisyUI スピナーを難易度ボタン領域に表示し、ボタンを disabled にする
- [ ] 2.3 fetch 完了（成功・フォールバック問わず）後にスピナーを非表示にし、ボタンを有効化する

## 3. DifficultyButtons の disabled 制御追加

- [ ] 3.1 外部から disabled 状態を切り替えられるメソッドを追加する

## 4. GameScene のクリーンアップ

- [ ] 4.1 `GameScene.create()` 内の `commentManager.load()` 呼び出しを削除し、キャッシュ済みデータを使うよう変更する

## 5. 環境変数の整備

- [ ] 5.1 `.env.example` に `VITE_COMMENTS_URL=` を追記する
- [ ] 5.2 GitHub Actions シークレット `VITE_COMMENTS_URL` に Blob URL を登録する（手順は下記参照）
- [ ] 5.3 GitHub Actions のビルドワークフローで `VITE_COMMENTS_URL` をビルド時に渡す設定を追加する

### GitHub への環境変数設定手順

Vite の環境変数（`VITE_` プレフィックス）はビルド時にコードへ焼き込まれる。
そのため GitHub Actions のシークレットとして登録し、`npm run build` 実行時に渡す必要がある。

#### 1. GitHub リポジトリにシークレットを登録する

1. GitHub リポジトリページ → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** をクリック
3. `Name` に `VITE_COMMENTS_URL`、`Secret` に Blob URL を入力して保存

```text
Name:   VITE_COMMENTS_URL
Secret: https://kinkaunion.blob.core.windows.net/kakutei-run/comments.json
```

#### 2. GitHub Actions のワークフローでシークレットを渡す

`.github/workflows/` 配下のビルドワークフロー（`azure-static-web-apps-*.yml` 等）の
`build` ステップに `env:` セクションを追加する。

```yaml
- name: Build
  run: npm run build
  env:
    VITE_COMMENTS_URL: ${{ secrets.VITE_COMMENTS_URL }}
```

Azure Static Web Apps の自動生成ワークフローを使っている場合は
`with:` ブロック内の `app_build_command` に渡す方法もある。

## 6. 動作確認

- [ ] 6.1 `VITE_COMMENTS_URL` に正しい Blob URL を設定してローカルで起動し、タイトル画面でスピナーが表示されコメントが取得できることを確認する
- [ ] 6.2 `VITE_COMMENTS_URL` を空にしてローカルで起動し、バンドル済み JSON でフォールバック動作することを確認する
- [ ] 6.3 DevTools でネットワークをオフラインにし、フォールバックが最終的にハードコード定数に落ちることを確認する
