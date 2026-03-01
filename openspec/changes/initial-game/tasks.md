# Tasks: initial-game

## 1. プロジェクト初期セットアップ

- [x] 1.1 Vite + TypeScript + Phaser 3 のプロジェクトを作成する（`npm create vite`）
- [x] 1.2 Phaser 3 と型定義（`@types/phaser`）を依存に追加する
- [x] 1.3 Vitest と testing-library を開発依存に追加する
- [x] 1.4 `tsconfig.json` を Phaser 向けに設定する（strict モード有効）
- [x] 1.5 `vite.config.ts` を設定する（アセットパス・ビルド出力先）
- [x] 1.6 ディレクトリ構成（`src/scenes`, `src/objects`, `src/systems`, `src/config`, `src/assets`, `public/assets/sprites`, `public/assets/audio`）を作成する
- [x] 1.7 `src/main.ts` に Phaser ゲームインスタンスを初期化する（960×540, FIT/CENTER, Arcade Physics）
- [x] 1.8 ローカル開発サーバーが起動し、空の Canvas が表示されることを確認する

## 2. アセット管理基盤

- [x] 2.1 `src/assets/AssetKeys.ts` を作成し、スプライト・音声・背景すべてのアセットキー定数を定義する
- [x] 2.2 プレースホルダー画像（色付き矩形PNGまたはCanvas生成）を `public/assets/sprites/` に配置する（自キャラ・敵・魔女・レシート・石ころ・税務署・背景2枚・地面タイル）
- [x] 2.3 スプライトシートのフレームサイズを `AssetKeys.ts` に定数として記載する

## 3. 難易度・ゲームパラメータ設定

- [x] 3.1 `src/config/difficultyConfig.ts` を作成し、難易度エントリの配列（`id`・`displayName`・`receiptCount`・`stoneFrequency`・`witchFrequency`・`scrollSpeed`・`stageLength`）を定義する（Easy/Normal/Hard の3段階をデフォルトとする）
- [x] 3.2 `src/config/gameConfig.ts` を作成し、`gravity`・`minJumpVelocity`・`maxJumpVelocity`・`maxChargeTime`・`witchSpeedReduction`・`witchDistanceFraction`・`witchScrollSpeedFactorMin`・`witchScrollSpeedFactorMax`・`witchYMin`・`witchYMax`・`receiptSpeedFactorMin`・`receiptSpeedFactorMax`・`receiptYMin`・`receiptYMax`・`objectMinDistance` を定義する。`witchSlowDuration` は `witchDistanceFraction` / (`scrollSpeed` × `witchSpeedReduction`) から自動計算するヘルパー関数として実装する
- [x] 3.3 `getDifficultyById(id: string)` 関数を実装しユニットテストを書く（存在しない id の場合のエラーハンドリング含む）

## 4. BootScene（アセット読み込み）

- [x] 4.1 `src/scenes/BootScene.ts` を作成し、全アセットの `load.*` 呼び出しを実装する
- [x] 4.2 ローディング進捗バーをシンプルな矩形で表示する
- [x] 4.3 読み込み完了後に TitleScene へ遷移する

## 5. タイトルシーン

- [x] 5.1 `src/scenes/TitleScene.ts` を作成し、タイトルテキストを表示する
- [x] 5.2 Easy / Normal / Hard の難易度選択ボタンを実装する（選択状態ハイライト付き）
- [x] 5.3 スタートボタンを実装し、選択難易度を GameScene に渡して遷移する

## 6. ゲームシーン基盤（スクロール）

- [x] 6.1 `src/scenes/GameScene.ts` を作成し、シーン init で難易度パラメータを受け取る
- [x] 6.2 `src/systems/ScrollManager.ts` を作成し、`tileSprite` による3レイヤー視差スクロールを実装する（遠景0.3倍・近景0.7倍・地面1.0倍）
- [x] 6.3 スクロールが滑らかに動作することをローカルで確認する

## 7. プレーヤーキャラクター

- [x] 7.1 `src/objects/Player.ts` を作成し、Arcade Physics スプライトとして初期化する
- [x] 7.2 チャージジャンプを実装する（押下時間に応じた初速計算、最大チャージ500msで上限固定）
- [x] 7.3 スペースキーとタッチイベントの両方をハンドリングする
- [x] 7.4 着地判定を実装し、空中では二重ジャンプを防ぐ
- [x] 7.5 4つのアニメーション状態（通常走行・腰痛走行・転倒・ゴール）を定義し切り替えを実装する
- [x] 7.6 腰痛状態の発動・自動回復（4秒後）を実装する
- [x] 7.7 `Player` クラスのジャンプ初速計算ロジックのユニットテストを書く

## 8. ランダムマップ生成

- [x] 8.1 `src/systems/MapGenerator.ts` を作成する
- [x] 8.2 難易度パラメータに基づき石ころをランダム配置する（スタートから200px以内は除外）
- [x] 8.3 難易度パラメータに基づきレシートをランダム配置する（地面・空中の両方）
- [x] 8.4 難易度パラメータに基づき魔女をランダム配置する
- [x] 8.5 税務署（ゴール）をステージ末端に固定配置する
- [x] 8.6 `MapGenerator` の配置ルール（最低距離・密度）のユニットテストを書く

## 9. 障害物・アイテム実装

- [x] 9.1 `src/objects/Stone.ts` を作成し、プレーヤーとの衝突で転倒イベントを発火する
- [x] 9.2 `src/objects/Witch.ts` を作成し、空中をスクロールする動作と衝突判定を実装する
- [x] 9.3 `src/objects/Receipt.ts` を作成し、地面・空中の配置と速度差（×0.8〜1.2）を実装する
- [x] 9.4 `src/systems/CollisionManager.ts` でプレーヤーと各オブジェクトの衝突ハンドラーを集約する
- [x] 9.5 `CollisionManager` の衝突判定ロジック（矩形オーバーラップ）のユニットテストを書く

## 10. レシートスコア・敵キャラクター

- [x] 10.1 レシート収集カウンターと回収率計算（収集数/総数×100）を `GameScene` に実装する
- [x] 10.2 スコア計算関数のユニットテストを書く
- [x] 10.3 `src/objects/Enemy.ts` を作成し、画面左端チラ見え配置と追跡ロジックを実装する
- [x] 10.4 魔女被弾カウントに応じた敵との距離縮小ロジックを実装する（1回=1/3縮小）
- [x] 10.5 敵がプレーヤーに追い付いたらゲームオーバーイベントを発火する

## 11. ゲームオーバー・クリアシーケンス

- [x] 11.1 石ころ転倒時のスクロール停止と敵接近シーケンスを実装する
- [x] 11.2 クリア時の「確定！！」テキスト演出と Phaser パーティクル（紙吹雪）を実装する
- [x] 11.3 クリア・ゲームオーバー双方から ResultScene へ遷移するロジックを実装する

## 12. HUD

- [x] 12.1 `src/ui/HUD.ts` を作成し、レシート収集数/総数・進行距離をゲーム画面上に常時表示する
- [ ] 12.2 魔女被弾回数をハート（❤️）などで視覚的に表示する（優先度:中）

## 13. リザルトシーン

- [x] 13.1 `src/scenes/ResultScene.ts` を作成し、クリア/ゲームオーバーの種別・スコアを受け取り表示する
- [x] 13.2 難易度選択付きリトライボタンを実装し TitleScene へ遷移する
- [x] 13.3 SNSシェアボタンを実装する（Canvas `toDataURL()` でスクリーンショット取得 + Web Share API）

## 14. スマホ対応

- [x] 14.1 canvas に `touch-action: none` と `user-select: none` を設定し、スクロール・ズームを無効化する
- [x] 14.2 iOS Safari でのタッチイベント `preventDefault()` を確認する
- [ ] 14.3 スマホ実機（またはデベロッパーツール）で1画面に収まることを確認する

## 15. デプロイ設定

- [x] 15.1 GitHub リポジトリを作成する
- [ ] 15.2 Azure Static Web Apps リソースを作成し接続設定（`staticwebapp.config.json`）を追加する
- [x] 15.3 GitHub Actions ワークフロー（build & deploy）を作成する
- [ ] 15.4 `main` ブランチへの push で自動デプロイされることを確認する

## 16. 不具合修正・仕様変更

- [x] 16.1 プレーヤーのX座標を画面横中央（`CANVAS_W / 2`）に修正する（`GameScene.ts` の `PLAYER_SCREEN_X`）
- [x] 16.2 プレーヤーの初期スポーン Y 座標を `GROUND_Y` に変更し、`setOrigin(0.5, 1)` を設定して足底を接地基準にする（`Player.ts`）
- [x] 16.3 敵キャラの初期距離をプレーヤー新位置（`CANVAS_W/2`）に合わせて再計算し、画面左端から約50px見える位置にする（`INITIAL_ENEMY_DISTANCE ≈ CANVAS_W/2 + スプライト半幅`）
- [x] 16.4 `MapGenerator` の最小配置X（`minX`）をゲーム開始時の初期スクリーン幅（`CANVAS_W = 960`）以上に変更し、ゲーム開始直後の画面にオブジェクトが表示されないようにする
- [ ] 16.5 スマートフォン縦画面フルスクリーン対応: `index.html` の viewport meta に `user-scalable=no` を追加し、CSS と Phaser Scale 設定を見直して縦画面でもゲームが全画面で表示されるよう対応する
- [x] 16.6 `Witch` / `Receipt` の `getBounds()` を `Phaser.GameObjects.Sprite` / `Image` の基底メソッドと衝突しない名前（例: `getHitBounds()`）にリネームし、`CollisionManager` での呼び出しも合わせて修正する（TypeScript 型エラー解消）
- [x] 16.7 `vite.config.ts` の `test` プロパティを削除し、`vitest.config.ts` を独立ファイルとして作成する（`defineConfig` を `vitest/config` からインポートすることで型エラーを解消）
- [x] 16.8 HUD から❤️表示を完全に削除する（`HUD.ts` の `witchHitText` フィールド・生成コード・`setWitchHitCount()` を削除し、`GameScene.ts` の `hud.setWitchHitCount()` 呼び出しも削除）
- [x] 16.9 地面コライダーの body サイズを修正する（`GameScene.ts` の `.setScale(CANVAS_W, 64)` を `.setDisplaySize(CANVAS_W, 64)` に変更し、コライダーが 960×64px になるよう修正。現状は `__DEFAULT` テクスチャが 32×32px のため body が 30720×2048 となりプレーヤーが正しい高さに着地できない）
- [x] 16.10 GameScene のイベントリスナー累積バグを修正する（Phaser はシーン再起動時に `this.events` のリスナーを自動削除しないため、`create()` 内の `this.events.on(...)` 登録前に同名リスナーを `this.events.off(...)` で削除するか、`shutdown` イベントで cleanup を行う。現状リトライのたびにリスナーが増殖しレシートカウントが正しく動作しない）
