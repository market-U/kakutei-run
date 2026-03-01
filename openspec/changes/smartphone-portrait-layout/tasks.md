# Tasks: smartphone-portrait-layout

## 1. キャンバスサイズ・ゾーン定数の導入

- [x] 1.1 `src/config/gameConfig.ts`（または新ファイル `src/config/canvasConfig.ts`）にゾーン定数を追加する（`CANVAS_W=960`, `CANVAS_H=1440`, `GAME_ZONE_Y=360`, `GAME_ZONE_HEIGHT=540`, `UI_BOTTOM_Y=900`）
- [x] 1.2 `src/main.ts` の Phaser GameConfig を `width: 960, height: 1440` に変更する
- [x] 1.3 `index.html` の viewport meta に `user-scalable=no` を追加する

## 2. ScrollManager のゾーン対応

- [x] 2.1 `src/systems/ScrollManager.ts` の背景 TileSprite（bgFar, bgNear）の y 座標と高さを `GAME_ZONE_Y` / `GAME_ZONE_HEIGHT` に基づいて配置する
- [x] 2.2 地面 TileSprite の y 座標に `GAME_ZONE_Y` オフセットを加算する
- [x] 2.3 `GROUND_Y` エクスポートをゲームゾーン内ローカル座標のまま維持し、画面座標が必要な箇所では `GROUND_Y + GAME_ZONE_Y` を使用する

## 3. GameScene のゾーン対応

- [x] 3.1 `GameScene.ts` のローカル定数 `CANVAS_W` / `CANVAS_H` を共通定数のインポートに置き換える（ゲームプレイ領域用に `GAME_ZONE_Y` をインポート）
- [x] 3.2 地面コライダー（staticImage）の配置 y 座標に `GAME_ZONE_Y` を加算する
- [x] 3.3 プレーヤーの初期 y 座標に `GAME_ZONE_Y` を加算する
- [x] 3.4 Stone / Witch / Receipt の生成時の y 座標に `GAME_ZONE_Y` を加算する
- [x] 3.5 税務署（ゴール）の配置 y 座標に `GAME_ZONE_Y` を加算する
- [x] 3.6 Enemy の y 座標に `GAME_ZONE_Y` を加算する
- [x] 3.7 クリア演出（「確定！！」テキスト・紙吹雪パーティクル）がゲームプレイゾーン内で表示されることを確認する

## 4. HUD の UI 上部ゾーン移動

- [x] 4.1 `src/ui/HUD.ts` のテキスト配置 y 座標を UI 上部ゾーン内（y=0〜360）に変更する
- [x] 4.2 HUD のフォントサイズをゾーンに合わせて調整する（縦長キャンバスで読みやすいサイズに）

## 5. TitleScene の縦長レイアウト対応

- [x] 5.1 タイトルテキストを UI 上部ゾーン（y=0〜360）に配置する
- [x] 5.2 難易度選択ボタンを UI 下部ゾーン（y=900〜1440）に**縦並び**で配置する
- [x] 5.3 スタートボタンを UI 下部ゾーン内の難易度ボタン下に配置する
- [x] 5.4 フォントサイズを縦長レイアウトに合わせて拡大する（タイトル: 72px〜、ボタン: 40px〜）

## 6. ResultScene の縦長レイアウト対応

- [x] 6.1 クリア/ゲームオーバーの見出しを UI 上部ゾーン（y=0〜360）に配置する
- [x] 6.2 スコア表示・リトライボタン・シェアボタンを UI 下部ゾーン（y=900〜1440）に配置する
- [x] 6.3 フォントサイズ・ボタンサイズを縦長レイアウトに合わせて拡大する

## 7. BootScene の調整

- [x] 7.1 BootScene のローディングバーを縦長キャンバスの中央付近に配置する

## 8. プレースホルダー画像の更新

- [x] 8.1 `scripts/generate-placeholders.mjs` の背景画像（bg_far, bg_near）のサイズをゲームプレイゾーンの高さ（540px）に合わせて維持する（※キャンバス全体ではなくゾーン内描画のため変更不要の可能性あり、要確認）

## 9. 動作確認

- [x] 9.1 ローカル開発サーバーでブラウザのデベロッパーツール（iPhone SE / iPhone 15 / Pixel 8 シミュレーション）を使い、縦画面で正しくゾーン分割表示されることを確認する
- [x] 9.2 UI下部ゾーンのタップでジャンプが動作することを確認する
- [x] 9.3 タイトル画面・リザルト画面の文字とボタンがスマホ縦画面で視認可能なサイズであることを確認する
- [x] 9.4 既存のユニットテスト（`npm test`）がすべてパスすることを確認する
