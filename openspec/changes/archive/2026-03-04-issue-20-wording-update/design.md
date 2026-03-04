# Design: ワーディング見直し

## Context

難易度名が英語汎用表記（Easy/Normal/Hard）のままで確定申告テーマとの統一感がなく、
READMEおよびspecにある具体的なパラメータ値が設定変更時に乖離するリスクがある。
本変更は純粋な文言修正であり、ゲームロジックや動作への影響はない。

## Goals / Non-Goals

**Goals:**

- `difficultyConfig.ts` の `displayName` を税務テーマの日本語名に変更する
- README から変動しうる具体パラメータ値の記述を削除し、設定ファイルへの参照に留める
- spec 文言を実態に合わせて修正する（旧表示名・古い具体値の削除）

**Non-Goals:**

- ゲームロジック・難易度パラメータ値の変更
- UIレイアウトや難易度の段階数の変更
- ゲームタイトル文字列（コード内）の変更

## Decisions

### 難易度表示名の形式

`displayName` を `"LV1 医療費控除"` / `"LV2 白色申告"` / `"LV3 青色申告"` とする。
レベル番号プレフィックス（`LV1〜LV3`）を付けることで順序と難易度感が一目で伝わる。

### README への具体値記載の扱い

難易度パラメータ（レシート枚数・障害物密度等）は `difficultyConfig.ts` で管理されており、
README への具体値記載は設定変更のたびに陳腐化する。「詳細は `src/config/difficultyConfig.ts` を参照」という案内に置き換える。

### 開発スクリプト一覧の更新

`package.json` に `dev:host`（`vite --host`：LAN内の他デバイスからアクセス可能な開発サーバー）が追加済みだが README に記載がなかった。
現行の `scripts` と同期し、全スクリプトを README に記載する。

## Risks / Trade-offs

- `displayName` 変更はUIテキストのみに影響するため、後退リスクは極めて低い
- spec の MODIFIED はアーカイブ時に基底 spec へマージされるため、delta spec の内容精度が重要
