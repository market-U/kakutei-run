# Proposal: ポーズ画面・リザルト画面にタイトルへ戻るボタンを追加

## Why

現状、タイトル画面に戻る手段がページのリロードしかなく、ゲームを途中でやめたいユーザーや、リザルト確認後に難易度を変えて最初からやり直したいユーザーに不便な体験を強いている。ポーズ画面とリザルト画面に「タイトルへ戻る」ボタンを追加することで、ユーザーがゲームの流れを自分でコントロールできるようにする。

## What Changes

- ポーズオーバーレイ（`#pause-overlay`）に「タイトルへ戻る」ボタンを追加する
- リザルト画面（`#result-screen`）に「タイトルへ戻る」ボタンを追加する
- タイトルへ戻るアクションを表す `kakutei:returnToTitle` カスタムイベントを新設する
- `main.ts` で `kakutei:returnToTitle` を受信し、ゲームシーンを破棄してタイトル画面を再表示するロジックを追加する

## Capabilities

### New Capabilities

- `return-to-title`: ポーズ画面・リザルト画面からタイトル画面へ戻る機能

### Modified Capabilities

- `scenes`: ポーズ機能・リザルト画面のシナリオに「タイトルへ戻る」操作を追加する

## Impact

- `src/main.ts`: `kakutei:returnToTitle` イベントのハンドラ追加
- `src/ui/PauseUI.ts`（または該当の HTML UI ファイル）: ボタン追加とイベント発火
- `src/ui/ResultUI.ts`（または該当の HTML UI ファイル）: ボタン追加とイベント発火
- `index.html`: ポーズオーバーレイ・リザルト画面の HTML にボタン要素を追加
- `openspec/specs/scenes/spec.md`: イベントテーブルとシナリオを更新
