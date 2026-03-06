# Tasks: issue-27-responsive-html-ui

## 1. HTML UI 基盤の追加（index.html / CSS）

- [ ] 1.1 `index.html` に HUD オーバーレイ用の `<div id="hud-overlay">` を追加し、レシート数・距離の表示要素を含める
- [ ] 1.2 `index.html` に縦横レイアウト切り替え用の CSS を追加する（`body.portrait` / `body.landscape` クラスによるキャンバスの表示切り替え）
- [ ] 1.3 `index.html` にタイトル画面 HTML 構造（`<div id="title-screen">`）を追加する
- [ ] 1.4 `index.html` にリザルト画面 HTML 構造（`<div id="result-screen">`）を追加する
- [ ] 1.5 `index.html` に手動切り替えボタン（`<button id="orientation-toggle">`）を追加し、常時表示される CSS を設定する
- [ ] 1.6 `index.html` にポーズボタン（`<button id="pause-btn">`）を追加し、ゲームプレイ中のみ表示される CSS を設定する
- [ ] 1.7 `index.html` にポーズオーバーレイ（`<div id="pause-overlay">`）を追加し、タップで解除できる CSS・構造を設定する

## 2. HUD の HTML オーバーレイ化

- [ ] 2.1 `src/ui/HUD.ts` の `receiptText` / `distanceText` を Phaser テキストオブジェクトから `document.getElementById()` への参照に変更する
- [ ] 2.2 `HUD.ts` コンストラクタから Phaser テキストオブジェクトの生成コードを削除する
- [ ] 2.3 `HUD.ts` の `refresh()` を DOM の `textContent` 更新に変更する（`setCollectedCount()` / `setDistance()` の呼び出しインターフェースは維持する）

## 3. BootScene の遷移変更

- [ ] 3.1 `src/scenes/BootScene.ts` の `create()` で `this.scene.start("TitleScene")` を `window.dispatchEvent(new CustomEvent('kakutei:assetsLoaded'))` に変更する

## 4. HTML タイトル UI の実装

- [ ] 4.1 `src/ui/TitleUI.ts` を新規作成し、`kakutei:assetsLoaded` イベント受信でタイトル画面を表示するクラスを実装する
- [ ] 4.2 難易度選択ボタンのハイライト切り替えロジックを `TitleUI.ts` に実装する
- [ ] 4.3 スタートボタン押下で `kakutei:startGame` イベントを `{ difficultyId }` とともに発火する処理を実装する
- [ ] 4.4 `main.ts` に `kakutei:startGame` イベントリスナーを追加し、受信時に Phaser の `GameScene` を起動する処理を実装する

## 5. HTML リザルト UI の実装

- [ ] 5.1 `src/ui/ResultUI.ts` を新規作成し、`kakutei:gameResult` イベント受信でリザルト画面を表示するクラスを実装する
- [ ] 5.2 クリア / ゲームオーバーの結果・レシート回収率・収集数表示を `ResultUI.ts` に実装する
- [ ] 5.3 SNS シェアボタンのロジック（`navigator.share()` / Twitter URL フォールバック）を `ResultUI.ts` に移植する
- [ ] 5.4 リトライボタン押下で `kakutei:retryGame` イベントを `{ difficultyId }` とともに発火する処理を実装する
- [ ] 5.5 `main.ts` に `kakutei:retryGame` イベントリスナーを追加し、受信時に Phaser の `GameScene` を指定難易度で再起動する処理を実装する

## 6. GameScene の変更

- [ ] 6.1 `GameScene.ts` のゲーム終了処理（クリア・ゲームオーバー）で `this.scene.start("ResultScene", ...)` を `window.dispatchEvent(new CustomEvent('kakutei:gameResult', { detail: {...} }))` に変更する
- [ ] 6.2 ポーズ状態の管理ロジック（スクロール一時停止・再開、ポーズオーバーレイの表示・非表示）を `GameScene.ts` に実装する
- [ ] 6.3 ポーズボタン（`#pause-btn`）のクリックでポーズをトリガーする処理を `GameScene.ts` に実装する
- [ ] 6.4 `GameScene.ts` に `kakutei:orientationChanged` イベントリスナーを追加し、ゲーム中の向き変化時にポーズ処理を呼び出す（すでにポーズ中は無視する）
- [ ] 6.5 ポーズオーバーレイ（`#pause-overlay`）のタップでポーズを解除する処理を `GameScene.ts` に実装する

## 7. OrientationManager の実装

- [ ] 7.1 `src/systems/OrientationManager.ts` を新規作成する
- [ ] 7.2 `screen.orientation.addEventListener('change')` による向き検知と、非対応環境向け `window.orientationchange` フォールバックを実装する
- [ ] 7.3 向き変化時に `body` の CSS クラス（`portrait` / `landscape`）を更新する処理を実装する
- [ ] 7.4 向き変化時に Phaser カメラのビューポートを切り替える処理を実装する（縦: フルキャンバス / 横: `setViewport(0, 0, 960, 540)` + `scrollY = 360`）
- [ ] 7.5 向き変化時に `kakutei:orientationChanged` イベントを発火する処理を実装する
- [ ] 7.6 手動切り替えボタン（`#orientation-toggle`）のクリックイベントを `OrientationManager.ts` に登録する
- [ ] 7.7 `main.ts` で `OrientationManager` を初期化し、Phaser の `game` インスタンスを渡す

## 8. Phaser 設定のクリーンアップ

- [ ] 8.1 `src/main.ts` の Phaser `scene` 配列から `TitleScene` と `ResultScene` を削除する
- [ ] 8.2 `src/scenes/TitleScene.ts` を削除する
- [ ] 8.3 `src/scenes/ResultScene.ts` を削除する

## 9. README の更新

- [ ] 9.1 `README.md` のアーキテクチャ説明を更新し、HTML UI 層と Phaser ゲーム層の構成・カスタムイベント通信を記述する
- [ ] 9.2 `README.md` の画面構成・ファイル構成の記述を最新化する（TitleScene・ResultScene の廃止と新ファイルの追加を反映する）
