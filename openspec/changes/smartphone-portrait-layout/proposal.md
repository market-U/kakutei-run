# Proposal: smartphone-portrait-layout

## Why

現在のゲームキャンバスは 960×540（横長 16:9）であり、スマートフォン縦持ち時に画面の 26% しか使えない。UIテキスト（タイトル48px → 実表示20px）やボタンが極端に小さくなり、操作性・視認性が著しく低い。ターゲットユーザーの過半数が iOS Safari の縦持ちでプレイすることを想定しており、スマホファーストのレイアウト再設計が必要である。

## What Changes

- キャンバスサイズを 960×540 から **960×1440（2:3 縦長）** に変更する
- キャンバスを3ゾーンに分割する：**UI上部（360px）・ゲームプレイ（540px）・UI下部（540px）**
- ゲームプレイゾーン（960×540）の物理・座標・スクロールロジックは**変更しない**
- タイトルシーン・リザルトシーンのUIレイアウトを縦長キャンバスに合わせて再配置する
- HUD をゲームプレイ領域の重畳表示から UI上部ゾーンへ移動する
- UI下部ゾーンでのタップ操作がゲームプレイ中のジャンプとして受け付けられるようにする
- `index.html` の viewport meta に `user-scalable=no` を追加する
- プレースホルダー背景画像をキャンバス新サイズに対応させる

## Capabilities

### New Capabilities

- `canvas-zones`: キャンバスを UI上部・ゲームプレイ・UI下部 の3ゾーンに分割し、シーンごとにゾーンの使い分けを定義する

### Modified Capabilities

- `scenes`: タイトルシーン・ゲームシーン（HUD配置）・リザルトシーンのレイアウトを縦長キャンバスのゾーン構成に変更する。ゲームプレイ領域は y=360〜900 のストリップに制限する

## Impact

- `src/main.ts`: キャンバスサイズ変更（height: 540 → 1440）
- `index.html`: viewport meta 更新
- `src/scenes/TitleScene.ts`: 縦長レイアウトに再配置（ボタン縦並び等）
- `src/scenes/ResultScene.ts`: 縦長レイアウトに再配置
- `src/scenes/GameScene.ts`: ゲームプレイゾーンの y オフセット（+360px）、地面コライダー位置調整
- `src/systems/ScrollManager.ts`: tileSprite の y・高さをゲームゾーンに制限
- `src/ui/HUD.ts`: UI上部ゾーンへの配置変更
- `src/objects/Enemy.ts`: CANVAS_WIDTH 定数は変更不要（ゲーム幅960維持）
- `scripts/generate-placeholders.mjs`: 背景画像サイズ更新
- ゲームロジック関連（`Player.ts`, `Stone.ts`, `Witch.ts`, `Receipt.ts`, `MapGenerator.ts`, `CollisionManager.ts`, `gameConfig.ts`, `difficultyConfig.ts`）は**変更不要**
