# 確定申告ラン (Kakutei-Run)

確定申告の締切をテーマにした横スクロールアクションゲームです。
バックエンド不要・URLアクセスだけでそのまま遊べます。

## ゲーム概要

プレーヤーはレシートを集めながら、石ころをかわし、魔女の攻撃に耐えつつゴールを目指します。
ゴール時のレシート回収率がスコアとなります。

### 操作方法

- **チャージジャンプ**: 画面タップ / スペースキーを長押しでチャージ（最大 500ms）、離した瞬間にジャンプ
  - 短押しで低いジャンプ、長押しで高いジャンプ

### 登場要素

| 要素 | 説明 |
|------|------|
| 石ころ | 地面に設置。接触するとゲームオーバー |
| レシート | 地面・空中に配置。接触で回収、ゴール時の回収率がスコア |
| 魔女 | 空中を浮遊。接触すると腰痛スロー状態になり、3回被弾でゲームオーバー条件 |
| 敵（税務署） | 画面左端からじわじわ追跡。魔女に被弾するたびに接近、追いつかれたらゲームオーバー |

### 難易度

3段階。スクロール速度・障害物密度・レシート枚数などが変化します。
詳細は [`src/config/difficultyConfig.ts`](src/config/difficultyConfig.ts) を参照してください。

## 技術スタック

| 項目 | 内容 |
|------|------|
| ゲームエンジン | [Phaser 3](https://phaser.io/) |
| 言語 | TypeScript |
| ビルドツール | Vite |
| テスト | Vitest |
| デプロイ先 | Azure Static Web Apps |

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# プレースホルダーアセット生成（初回のみ）
npm run generate-placeholders
```

## 開発

```bash
# 開発サーバー起動 (http://localhost:5173)
npm run dev

# 開発サーバー起動（LAN公開モード・他デバイスからのアクセス可）
npm run dev:host
```

## テスト

```bash
# 単体テスト実行
npm test

# ウォッチモード
npm run test:watch
```

## ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

ビルド成果物は `dist/` に出力されます。

## プロジェクト構成

```text
src/
├── main.ts              # エントリーポイント
├── assets/
│   └── AssetKeys.ts     # アセットキー定数
├── config/
│   ├── canvasConfig.ts  # キャンバスサイズ設定
│   ├── difficultyConfig.ts  # 難易度パラメータ
│   └── gameConfig.ts    # ゲーム共通パラメータ
├── objects/             # ゲームオブジェクト
│   ├── Player.ts
│   ├── Enemy.ts
│   ├── Receipt.ts
│   ├── Stone.ts
│   └── Witch.ts
├── scenes/              # Phaser シーン
│   ├── BootScene.ts     # アセット読み込み
│   ├── TitleScene.ts    # タイトル・難易度選択
│   ├── GameScene.ts     # ゲーム本体
│   └── ResultScene.ts   # リザルト・SNSシェア
├── systems/             # ゲームロジック
│   ├── CollisionManager.ts
│   ├── MapGenerator.ts
│   ├── ScrollManager.ts
│   └── gameUtils.ts
└── ui/
    └── HUD.ts           # スコア・HP表示

public/
└── assets/
    ├── sprites/         # スプライトシート（差替え可能）
    └── audio/           # BGM・SE（差替え可能）
```

## アセットの差し替え

グラフィックや音声は `public/assets/` 以下に配置し、`src/assets/AssetKeys.ts` でキーとファイル名を管理しています。
コードを変更せずにファイルを差し替えるだけで反映されます。
