# Design: comments.json を Azure Blob Storage から取得する

## Context

現在 `CommentManager.load()` は `GameScene.create()` 内で呼ばれており、ゲーム開始のたびに `/comments.json`（バンドル済み）を fetch している。
今回は取得先を Azure Blob Storage のパブリック URL に変更し、取得タイミングをタイトル画面表示時に移動する。

## Goals / Non-Goals

**Goals:**

- コメントデータをパブリック Azure Blob URL から取得する
- fetch をタイトル画面表示時に行い、完了するまでゲーム開始をブロックする
- タイムアウト・リトライ・フォールバックで堅牢な取得フローを実現する
- fetch 中はスピナーを表示し UX を損なわない

**Non-Goals:**

- API エンドポイントの新設
- コメントデータのキャッシュ（TTL、localStorageへの保存）
- fetch 完了状態の永続化

## Decisions

### 1. データ受け渡し：`window.__commentsData` キャッシュ方式を採用

**選択肢：**

| 案 | 概要 | 評価 |
| -- | ---- | ---- |
| A: `window.__commentsData` にキャッシュ | TitleUI が fetch → グローバルに保持。GameScene は CommentManager 初期化時にキャッシュを参照 | ✅ シンプル、変更範囲が最小 |
| B: `main.ts` でデータを保持し scene.start() に渡す | Phaser の `data` 経由で渡す | ⚠️ Phaser の初期化タイミングに依存し複雑 |
| C: CommentManager をシングルトンにする | Scene をまたいで保持 | ❌ Phaser Scene ライフサイクルと相性が悪い |

**決定：A を採用。** `window.__commentsData` を `CommentsData | null` 型で保持し、`CommentManager` はコンストラクタでキャッシュを参照する。キャッシュがなければフォールバック定数を使う。

### 2. fetch タイムアウト：AbortController で 5 秒

`fetch` の `signal` に `AbortController` を渡してタイムアウトを実装する。`Promise.race` より `AbortController` の方が fetch をキャンセルできるため好ましい。

### 3. リトライ：最大 3 回、固定間隔なし（即リトライ）

コメント JSON は小さいファイルであり、ネットワーク瞬断が主な失敗原因と想定。バックオフは複雑さに対してメリットが薄いため、即リトライ（ウェイトなし）を採用する。

### 4. フォールバック順序

```
Azure Blob URL (VITE_COMMENTS_URL) → 3回失敗
  → /comments.json（バンドル済みフォールバック）を fetch
      → 失敗した場合はハードコード FALLBACK_COMMENTS を使用
```

### 5. ローディング UI：DaisyUI の `loading loading-spinner`

TitleUI（HTML/CSS 層）は既に DaisyUI を使用している。難易度ボタンコンテナにスピナーを表示し、fetch 完了後にボタンへ差し替える。

### 6. URL 管理：`VITE_COMMENTS_URL` 環境変数

Vite のビルド時環境変数として焼き込む。ローカル開発時は `.env.local` に設定し、Azure Static Web Apps へのデプロイ時は GitHub Actions シークレット経由で渡す。未設定の場合はフォールバック（`/comments.json`）を直接使う。

## Risks / Trade-offs

- **[リスク] SAS URL ではなくパブリック Blob のため誰でも読める**
  → `comments.json` の内容は機密でないため許容する。書き込みは Azure Storage 認証が必要なため、読み取り専用公開は問題ない。

- **[リスク] VITE_COMMENTS_URL が未設定の場合**
  → 環境変数が空文字 or 未定義の場合は Blob fetch をスキップし、`/comments.json` を直接 fetch するフォールバックフローに入る。ゲームは動作し続ける。

- **[トレードオフ] グローバル変数（`window.__commentsData`）の使用**
  → 今回は状態管理ライブラリを導入するほどでないため許容。型定義（`CommentsData | null`）で安全性を担保する。

## Migration Plan

1. Azure Blob Storage コンテナを作成し、アクセスレベルを「Blob」に設定する
2. `comments.json` を Blob にアップロードする
3. Blob の URL を GitHub Actions シークレット `VITE_COMMENTS_URL` に登録する
4. 実装を deploy する
5. ロールバック：`VITE_COMMENTS_URL` を空にするだけでフォールバック動作になる

## Open Questions

- なし（すべて explore フェーズで決定済み）
