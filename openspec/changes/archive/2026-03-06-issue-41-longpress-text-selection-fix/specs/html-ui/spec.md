# Spec: html-ui (delta)

## ADDED Requirements

### Requirement: HTML UI でのテキスト選択禁止

HTML UI オーバーレイ全体（HUD・タイトル画面・リザルト画面・ポーズオーバーレイを含む）において、ユーザーによるテキスト選択を禁止しなければならない（SHALL）。また iOS Safari のロングタップコンテキストメニューを表示してはならない（SHALL NOT）。

#### Scenario: ロングタップ時にテキストが選択されない

- **WHEN** ユーザーが HTML UI 要素上でロングタップ（長押し）操作を行う
- **THEN** テキストが選択状態にならない
- **AND** ブラウザのテキスト選択ハイライトが表示されない

#### Scenario: iOS Safari のコンテキストメニューが表示されない

- **WHEN** iOS Safari 上でユーザーが HTML UI 要素上でロングタップする
- **THEN** 「コピー / 選択 / 全選択」コンテキストメニューが表示されない
