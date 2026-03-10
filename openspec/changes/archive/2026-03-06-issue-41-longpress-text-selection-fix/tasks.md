# Tasks: issue-41-longpress-text-selection-fix

## Task 1. HTML UI ロングタップテキスト選択の禁止

- [x] 1.1 `src/style.css` の `body` ルールに `user-select: none` / `-webkit-user-select: none` / `-webkit-touch-callout: none` を追加する

## Task 2. 動作確認

- [x] 2.1 スマホ実機またはブラウザの Touch Simulation で HUD・タイトル画面・リザルト画面をロングタップし、テキスト選択が発生しないことを確認する
- [x] 2.2 iOS Safari でロングタップコンテキストメニューが表示されないことを確認する
