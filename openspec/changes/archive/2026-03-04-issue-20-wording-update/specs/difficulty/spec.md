# Delta Spec: difficulty

## MODIFIED Requirements

### Requirement: 難易度の定義が設定ファイルで管理される

難易度の選択肢・段階数・各パラメータはすべて `src/config/difficultyConfig.ts` の配列で定義され、コードを変更せずに難易度の追加・削除・並び替えができる。

#### Scenario: 難易度の追加

- **WHEN** 開発者が `difficultyConfig.ts` の配列に新しいエントリを追加する
- **THEN** タイトル画面の難易度選択UIに新しい難易度が自動的に追加される

#### Scenario: 難易度の削除

- **WHEN** 開発者が `difficultyConfig.ts` の配列からエントリを削除する
- **THEN** タイトル画面の難易度選択UIからその難易度が除外される

#### Scenario: デフォルト3段階での動作

- **WHEN** デフォルト設定（LV1 医療費控除 / LV2 白色申告 / LV3 青色申告 の3段階）が使用される
- **THEN** `difficultyConfig.ts` に定義されたパラメータでゲームが動作する
