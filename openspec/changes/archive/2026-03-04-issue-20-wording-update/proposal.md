# Proposal: ワーディング見直し（タイトル・難易度名・README）

## Why

ゲームの難易度名が "Easy/Normal/Hard" という汎用的な英語表記になっており、確定申告テーマの世界観が活かされていない。また README に具体的なパラメータ値が記載されているため、`difficultyConfig.ts` の設定値が変わるたびに README も更新しなければならず、陳腐化しやすい。

## What Changes

- `difficultyConfig.ts` の `displayName` を税務テーマに沿った日本語名（LV1 医療費控除 / LV2 白色申告 / LV3 青色申告）へ変更
- `README.md` の難易度説明を更新し、具体的なパラメータ値（レシート枚数等）は記載せず設定ファイルへの参照に留める
- `README.md` の開発スクリプト一覧を更新し、`dev:host`（LAN公開モード）など `package.json` に追加済みのスクリプトを追記する
- `openspec/specs/difficulty/spec.md` のシナリオ文言を更新（旧表示名・古い具体値を削除）
- `openspec/specs/scenes/spec.md` のタイトルシーンシナリオから "Easy/Normal/Hard" のハードコードを削除し、`displayName` を参照する旨に修正

## Capabilities

### New Capabilities

なし

### Modified Capabilities

- `difficulty`: デフォルトの難易度表示名が "Easy/Normal/Hard" から税務テーマ名に変わるため、spec のシナリオ文言を更新する
- `scenes`: タイトルシーンシナリオにハードコードされた "Easy/Normal/Hard" を削除し、各難易度の `displayName` を使用する旨に変更する

## Impact

- `src/config/difficultyConfig.ts`（`displayName` の変更）
- `README.md`（難易度説明・具体パラメータ値の削除、開発スクリプト一覧の更新）
- `openspec/specs/difficulty/spec.md`（シナリオ文言の修正）
- `openspec/specs/scenes/spec.md`（タイトルシーンシナリオの修正）
