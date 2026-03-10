# 確定申告ラン (Kakutei-Run)

確定申告の締切をテーマにした横スクロールアクションゲームです。
バックエンド不要・URLアクセスだけでそのまま遊べます。

## ゲーム概要

プレーヤーはレシートを集めながら、石ころをかわし、魔女の攻撃に耐えつつゴールを目指します。
ゴール時のレシート回収率がスコアとなります。

### 操作方法

- **チャージジャンプ**: 画面タップ / スペースキーを長押しでチャージ、離した瞬間にジャンプ
  - 短押しで低いジャンプ、長押しで高いジャンプ

### 登場要素

| 要素 | 説明 |
|------|------|
| 石ころ | 地面に設置。接触するとゲームオーバー |
| レシート | 地面・空中に配置。接触で回収、ゴール時の回収率がスコア |
| 魔女 | 空中を浮遊。接触すると腰痛スロー状態になる |
| 敵 | 画面左端から追跡。腰痛で走るのが遅くなるとじわじわ接近、追いつかれたらゲームオーバー |

### 難易度

スクロール速度・障害物密度・レシート枚数などが変化します。
詳細は [`src/config/difficultyConfig.ts`](src/config/difficultyConfig.ts) を参照してください。

## 技術スタック

| 項目 | 内容 |
|------|------|
| ゲームエンジン | [Phaser 3](https://phaser.io/) |
| 言語 | TypeScript |
| ビルドツール | Vite |
| テスト | Vitest |
| デプロイ先 | Azure Static Web Apps |

## アーキテクチャ

本プロジェクトは **Phaser ゲーム層** と **HTML UI 層** の2層で構成されています。

```text
┌─────────────────────────────────────────┐
│  HTML UI 層（index.html + TypeScript）   │
│  ・タイトル画面  ・リザルト画面           │
│  ・HUD オーバーレイ（レシート数・距離）    │
│  ・ポーズオーバーレイ                     │
│  ・向き切り替えボタン / ポーズボタン       │
├─────────────────────────────────────────┤
│  Phaser ゲーム層                         │
│  ・BootScene（アセット読み込み）          │
│  ・GameScene（ゲームプレイ本体）          │
└─────────────────────────────────────────┘
```

### 層間の通信

両層は `window.dispatchEvent` によるカスタムイベントで疎結合に通信します。

| イベント名 | 発火元 | 受信先 | 内容 |
|---|---|---|---|
| `kakutei:assetsLoaded` | BootScene | TitleUI | アセット読み込み完了 |
| `kakutei:startGame` | TitleUI | main.ts | ゲーム開始（difficultyId） |
| `kakutei:gameResult` | GameScene | ResultUI | 結果通知（result / collected / total / difficultyId） |
| `kakutei:retryGame` | ResultUI | main.ts | リトライ（difficultyId） |
| `kakutei:orientationChanged` | OrientationManager | GameScene | 画面向き変化（orientation） |

### 縦横画面対応

`OrientationManager` が端末回転と手動ボタンの両方を処理します。

- **縦画面**: Phaser キャンバス 960×1440、カメラは全体を表示
- **横画面**: Phaser キャンバス 960×540（ゲームゾーンのみ）、Scale.FIT で画面にフィット
- ゲーム中の向き変化時は自動的にポーズ状態になります

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
│   ├── BootScene.ts     # アセット読み込み（完了後 kakutei:assetsLoaded を発火）
│   └── GameScene.ts     # ゲーム本体
├── systems/             # ゲームロジック
│   ├── CollisionManager.ts
│   ├── MapGenerator.ts
│   ├── OrientationManager.ts  # 縦横画面の切り替え管理
│   ├── ScrollManager.ts
│   └── gameUtils.ts
└── ui/
    ├── HUD.ts           # レシート数・距離のHTML要素更新
    ├── TitleUI.ts       # タイトル画面（HTML）
    └── ResultUI.ts      # リザルト画面（HTML）

public/
└── assets/
    ├── sprites/         # スプライトシート（差替え可能）
    └── audio/           # BGM・SE（差替え可能）
```

## アセットの差し替え

グラフィックや音声は `public/assets/` 以下に配置し、`src/assets/AssetKeys.ts` でキーとファイル名を管理しています。
コードを変更せずにファイルを差し替えるだけで反映されます。
