# Spec: deployment

## Requirement: 静的アセットの正確な MIME タイプ配信

Azure Static Web Apps は Vite でビルドされた JavaScript モジュール（`.js`）を `application/javascript` として配信しなければならない（SHALL）。

### Scenario: ビルド済み JS ファイルへのアクセス

- **WHEN** ブラウザが `/assets/index-*.js` へリクエストを送る
- **THEN** サーバーは `Content-Type: application/javascript` で応答する
- **AND** ブラウザは `<script type="module">` としてファイルを読み込むことができる

### Scenario: WASM ファイルへのアクセス

- **WHEN** ブラウザが `.wasm` ファイルへリクエストを送る
- **THEN** サーバーは `Content-Type: application/wasm` で応答する

---

## Requirement: SPA ルーティングのフォールバック

存在しない URL パスへのリクエストは `index.html` にリライトされ、クライアントサイドルーティングが機能しなければならない（SHALL）。

### Scenario: 未登録パスへのナビゲーション

- **WHEN** ユーザーが `/game` など未登録のパスに直接アクセスする
- **THEN** サーバーは `index.html` の内容を返す
- **AND** ゲームアプリが正常に起動する

### Scenario: 静的アセットはフォールバック対象外

- **WHEN** ブラウザが `/assets/` 配下の静的ファイルへリクエストを送る
- **THEN** サーバーはフォールバックせず、対象の静的ファイルをそのまま返す
