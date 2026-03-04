# Tasks: ワーディング見直し（タイトル・難易度名・README）

## 1. 難易度表示名の更新

- [ ] 1.1 `src/config/difficultyConfig.ts` の `displayName` を `"LV1 医療費控除"` / `"LV2 白色申告"` / `"LV3 青色申告"` に変更する

## 2. README の更新

- [ ] 2.1 `README.md` の難易度セクションから具体的なパラメータ値（スクロール速度・障害物密度等）を削除し、「詳細は `src/config/difficultyConfig.ts` を参照」という案内に置き換える
- [ ] 2.2 `README.md` の開発スクリプト一覧に `dev:host`（LAN公開モード）を追記し、`package.json` の全スクリプトと同期する
