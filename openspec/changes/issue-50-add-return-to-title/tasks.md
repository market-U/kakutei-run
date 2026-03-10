# Tasks: ポーズ画面・リザルト画面にタイトルへ戻るボタンを追加

## 1. HTML マークアップ追加

- [ ] 1.1 `index.html` のポーズオーバーレイ（`#pause-overlay`）に「ゲームに戻る」ボタン（`#pause-resume-btn`）と「タイトルへ戻る」ボタン（`#pause-return-title-btn`）を追加する
- [ ] 1.2 `index.html` のリザルト画面（`#result-screen`）に「タイトルへ戻る」ボタン（`#result-return-title-btn`）を追加する

## 2. GameScene のポーズ処理を変更

- [ ] 2.1 `onPauseOverlayClick` のイベントリスナーを削除し、ポーズオーバーレイ全体クリックでのゲーム再開を廃止する
- [ ] 2.2 「ゲームに戻る」ボタン（`#pause-resume-btn`）にクリックリスナーを追加し、クリック時にゲームを再開する
- [ ] 2.3 「タイトルへ戻る」ボタン（`#pause-return-title-btn`）にクリックリスナーを追加し、クリック時に `#pause-overlay` を非表示にしてから `kakutei:returnToTitle` イベントを発火する
- [ ] 2.4 SHUTDOWN イベントのクリーンアップに 2.2 と 2.3 で追加したリスナーの `removeEventListener` を追加する

## 3. ResultUI にタイトルへ戻るボタンを追加

- [ ] 3.1 `ResultUI.ts` の `show()` メソッド内で「タイトルへ戻る」ボタン（`#result-return-title-btn`）にクリックリスナーを設定し、クリック時に `hide()` を呼んでから `kakutei:returnToTitle` イベントを発火する

## 4. イベントハンドラの追加

- [ ] 4.1 `TitleUI.ts` のコンストラクタで `kakutei:returnToTitle` をリッスンし、`show()` を呼ぶ
- [ ] 4.2 `main.ts` に `kakutei:returnToTitle` のハンドラを追加し、`game.scene.stop("GameScene")` を実行する
