# Spec Delta: niconico-comments

## MODIFIED Requirements

### Requirement: コメントデータの読み込み

システムはタイトル画面の表示時に `VITE_COMMENTS_URL` 環境変数で指定された Azure Blob Storage のパブリック URL から `comments.json` を fetch し、コメントデータを読み込まなければならない（SHALL）。
fetch は 1 回あたり 5 秒のタイムアウトを設け、失敗時は最大 3 回リトライしなければならない（SHALL）。
3 回すべて失敗した場合はバンドル済みの `/comments.json` を fetch し、それも失敗した場合はハードコードされたフォールバックコメントを使用しなければならない（SHALL）。
fetch が完了するまで（成功・フォールバック問わず）難易度選択ボタンは無効化され、ローディングスピナーを表示しなければならない（SHALL）。

#### Scenario: Blob URL から正常に fetch できる場合

- **WHEN** タイトル画面が表示される
- **THEN** `VITE_COMMENTS_URL` の URL から JSON を取得し、コメントデータとして保持する
- **AND** ローディングスピナーが非表示になり、難易度選択ボタンが有効化される

#### Scenario: fetch がタイムアウトする場合

- **WHEN** `VITE_COMMENTS_URL` への fetch が 5 秒以内に完了しない
- **THEN** そのリクエストをキャンセルし、リトライカウントを 1 増やして再試行する

#### Scenario: 3 回すべてのリトライが失敗した場合

- **WHEN** `VITE_COMMENTS_URL` への fetch が 3 回すべて失敗する（タイムアウト・エラー問わず）
- **THEN** バンドル済みの `/comments.json` を fetch してフォールバックとして使用する
- **AND** コンソールに警告を出力する

#### Scenario: バンドル済み JSON のフォールバックも失敗した場合

- **WHEN** バンドル済み `/comments.json` の fetch も失敗する
- **THEN** ハードコードされたフォールバックコメント定数を使用する

#### Scenario: fetch 中のローディング表示

- **WHEN** タイトル画面が表示され fetch が進行中である
- **THEN** DaisyUI の `loading-spinner` が難易度ボタン領域に表示される
- **AND** 難易度選択ボタンは disabled 状態である

#### Scenario: `VITE_COMMENTS_URL` が未設定の場合

- **WHEN** `VITE_COMMENTS_URL` が空文字または未定義である
- **THEN** Blob fetch をスキップしてバンドル済み `/comments.json` を直接 fetch する

#### Scenario: fetch に失敗した場合（旧シナリオを置き換え）

- **WHEN** すべての fetch 試行が失敗する
- **THEN** フォールバックのハードコードコメント配列を使用し、エラーは握り潰さずコンソールへ出力する
