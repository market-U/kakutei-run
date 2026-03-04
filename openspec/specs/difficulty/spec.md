# Spec: difficulty

## Requirement: 難易度の定義が設定ファイルで管理される

難易度の選択肢・段階数・各パラメータはすべて `src/config/difficultyConfig.ts` の配列で定義され、コードを変更せずに難易度の追加・削除・並び替えができる。

### Scenario: 難易度の追加

- **WHEN** 開発者が `difficultyConfig.ts` の配列に新しいエントリを追加する
- **THEN** タイトル画面の難易度選択UIに新しい難易度が自動的に追加される

### Scenario: 難易度の削除

- **WHEN** 開発者が `difficultyConfig.ts` の配列からエントリを削除する
- **THEN** タイトル画面の難易度選択UIからその難易度が除外される

### Scenario: デフォルト3段階での動作

- **WHEN** デフォルト設定（LV1 医療費控除 / LV2 白色申告 / LV3 青色申告 の3段階）が使用される
- **THEN** `difficultyConfig.ts` に定義されたパラメータでゲームが動作する

---

## Requirement: 難易度の表示名が設定ファイルで指定できる

各難易度エントリは内部キーとは別に、UI上に表示する任意の表示名を持つ。

### Scenario: 表示名による画面表示

- **WHEN** タイトルシーンが難易度選択UIを描画する
- **THEN** 内部キーではなく `displayName` に指定された文字列が表示される

### Scenario: 数値レベル表現への変更

- **WHEN** 開発者が `displayName` を "Lv.1"〜"Lv.10" のような数値形式に設定する
- **THEN** UI上に "Lv.1"〜"Lv.10" が表示され、ゲームロジックは内部キーで動作する

---

## Requirement: 各難易度エントリのパラメータ構造

難易度エントリは以下のフィールドを持つ。

### Scenario: 必須フィールドの取得

- **WHEN** 難易度エントリが参照される
- **THEN** `id`（内部キー文字列）・`displayName`（表示名）・`receiptCount`（レシート枚数）・`stoneFrequency`（石ころ密度）・`witchFrequency`（魔女頻度）・`scrollSpeed`（スクロール速度）・`stageLength`（ステージ長）が取得できる

---

## Requirement: チューニング可能なゲームパラメータ

難易度によらないゲーム全体の物理パラメータは `src/config/gameConfig.ts` で一元管理される。

### Scenario: パラメータの一元管理

- **WHEN** 開発者がゲームパラメータを変更したい
- **THEN** `src/config/` 内のファイルのみを編集するだけで変更が全体に反映される

### Scenario: チューニング対象パラメータ

- **WHEN** 設定ファイルが参照される
- **THEN** 重力加速度・最小/最大ジャンプ初速・最大チャージ時間・`witchSpeedReduction`（魔女被弾時速度低下率）・`witchDistanceFraction`（被弾1回で詰まる距離の割合）が含まれる。腰痛スローの継続時間はこの2値とスクロール速度から自動計算されるため、設定ファイルへの直接記載は不要とする
