# Proposal: issue-41-longpress-text-selection-fix

## Why

ジャンプチャージのロングタップ操作時に、HTML UI オーバーレイ要素（HUD・タイトル画面・リザルト画面など）のテキストが選択されたり、iOS Safari のコンテキストメニューが表示されてしまう。Phaser キャンバスには `user-select: none` が適用済みだが、HTML UI 層には未適用のため発生している。

## What Changes

- HTML UI 全体（`body` または各オーバーレイ要素）に `user-select: none` / `-webkit-user-select: none` を適用し、テキスト選択を禁止する
- iOS Safari の長押しコンテキストメニュー（コピー・選択メニュー）を抑制するため `-webkit-touch-callout: none` を追加する

## Capabilities

### New Capabilities

### Modified Capabilities

- `html-ui`: ロングタップ時のテキスト選択・コンテキストメニュー表示を禁止する要件を追加

## Impact

- `src/style.css`: `body` またはオーバーレイ要素への `user-select` / `-webkit-touch-callout` の追加
