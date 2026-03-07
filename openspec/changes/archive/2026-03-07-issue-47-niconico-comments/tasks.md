# tasks: ニコ生風コメント表示機能

## 1. コメントデータの準備

- [x] 1.1 `public/comments.json` を作成し、全カテゴリ（common / difficulty / events）のモックコメントを記述する

## 2. CommentManager の実装

- [x] 2.1 `src/systems/CommentManager.ts` を作成し、`load(url)` による `comments.json` の fetch とフォールバック処理を実装する
- [x] 2.2 `startGame(difficultyId)` でアクティブプール（common + difficulty）を合成する処理を実装する
- [x] 2.3 6 レーン構成のレーン管理ロジック（重なり防止・レーン選択）を実装する
- [x] 2.4 コメントスポーン処理（通常の定期スポーン・速度計算・Phaser Text 生成・画面外で自動 destroy）を実装する
- [x] 2.5 `triggerEvent(type, count)` によるバーストスポーン処理を実装する
- [x] 2.6 `setEnabled(v)` によるコメント表示 ON/OFF 切り替えを実装する
- [x] 2.7 `update(delta)` でアクティブコメントを毎フレーム移動させる処理を実装する

## 3. GameScene への統合

- [x] 3.1 `GameScene.create()` で `CommentManager` をインスタンス化し、`load()` を呼び出す
- [x] 3.2 `stoneHit` イベントで `triggerEvent('stumble', 6)` を呼び出す
- [x] 3.3 `backPainActivated` イベントで `triggerEvent('backPain', 4)` を呼び出す
- [x] 3.4 ゴール到達時（`onGoalReached`）で `triggerEvent('goal', 9)` を呼び出す
- [x] 3.5 `GameScene.update()` で `CommentManager.update(delta)` を呼び出す
- [x] 3.6 `SHUTDOWN` イベントで `CommentManager.destroy()` を呼び出す

## 4. HUD トグルボタンの追加

- [x] 4.1 `index.html` にコメントトグルボタン要素（`id="comment-toggle-btn"`）を `pause-btn` の隣に追加する
- [x] 4.2 `HUD.ts` でトグルボタンの表示/非表示と ON/OFF 状態の視覚フィードバック（opacity）を制御する
- [x] 4.3 トグルボタンのクリックイベントで `CommentManager.setEnabled()` を呼び出す処理を `GameScene` に追加する
