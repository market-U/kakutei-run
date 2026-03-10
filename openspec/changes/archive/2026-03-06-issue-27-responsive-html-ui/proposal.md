# Proposal: issue-27-responsive-html-ui

## Why

スマホ縦画面ではゲームゾーンがキャンバスの37.5%しか使えず、キャラクターが小さすぎてプレイ体験が損なわれている。横画面（16:9）ではゲームゾーンを画面いっぱいに表示できるポテンシャルがあるが、現状の実装では縦長キャンバス全体が縮小されるだけで恩恵がない。また、PhaserテキストベースのHUDはCSSでのデザインが困難で、今後のUI改善（Issue #3）の妨げにもなっている。

## What Changes

- **TitleScene・ResultScene を HTML/CSS で再実装する**: Phaser シーンとしての実装を廃止し、HTML要素として描画する。これにより縦横両レイアウトへの対応とCSSによるデザイン改善（Issue #3）の土台が整う
- **HUD を HTML オーバーレイに移行する**: GameScene から Phaserテキストを削除し、キャンバス上に重ねたHTML要素で表示する。縦画面・横画面で同じデザインが使われ、canvas のUI上部・下部ゾーンは無地になる
- **横画面レイアウトを新設する**: 横画面時に Phaser カメラのビューポートをゲームゾーン（y=360〜900）のみに切り替え、CSS でキャンバスを拡大表示する。ゲームロジック・座標系は一切変更しない
- **OrientationManager を新規作成する**: 端末回転の検知、手動切り替えボタン、ゲーム中回転時のポーズを管理する

## Capabilities

### New Capabilities

- `orientation-layout`: 縦画面・横画面の検知と切り替え。端末回転の自動検知（orientationchange）と手動ボタンによる切り替え、ゲーム中回転時のポーズ表示を含む
- `html-ui`: HTML/CSSによるUI層。HUD（レシート数・進行距離）、タイトル画面、リザルト画面の実装。Phaserとのデータ受け渡しはカスタムイベント経由で行う

### Modified Capabilities

- `canvas-zones`: UI上部・下部ゾーンの役割変更。両ゾーンはPhaser上では無地の背景となり、UI表示の責務はHTMLオーバーレイに移る
- `scenes`: TitleScene・ResultSceneの実装がHTMLに変わる。BootScene・GameSceneはPhaser実装を維持する

## Impact

- `index.html`: HUD overlay div、タイトル・リザルトのHTML構造、横画面用CSS追加
- `src/ui/HUD.ts`: PhaserテキストからDOM更新に変更
- `src/scenes/TitleScene.ts`: 廃止（HTML実装に置き換え）
- `src/scenes/ResultScene.ts`: 廃止（HTML実装に置き換え）
- `src/scenes/BootScene.ts`: 遷移先をTitleScene（Phaser）からHTMLタイトルUIに変更
- `src/main.ts`: OrientationManager の初期化追加
- 新規 `src/systems/OrientationManager.ts`: 向き管理ロジック
- **変更なし**: ScrollManager, CollisionManager, MapGenerator, Player, Enemy, Witch, Receipt, Stone, canvasConfig の座標定数
