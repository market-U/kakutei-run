# Design: ポーズ画面・リザルト画面にタイトルへ戻るボタンを追加

## Context

既存のシーン管理は Phaser の `GameScene` と HTML UI レイヤー（`TitleUI` / `ResultUI`）が `window` カスタムイベントで疎結合に通信するアーキテクチャを採用している。

- タイトル起動: `kakutei:assetsLoaded` → `TitleUI.show()`
- ゲーム開始: `kakutei:startGame` → `main.ts` が `game.scene.start("GameScene")`
- リトライ: `kakutei:retryGame` → `main.ts` が `game.scene.start("GameScene")`
- ポーズ解除: `GameScene` が `#pause-overlay` へのクリックで再開（オーバーレイ全体がタップ領域）

タイトルへ戻るための経路が現状存在しない。
また、現在のポーズオーバーレイは「どこかをタップすれば再開」という方式だが、「タイトルへ戻る」ボタンを追加すると意図しない再開が発生しうるため、ポーズ解除の操作もボタン化する。

## Goals / Non-Goals

**Goals:**

- ポーズ画面（`#pause-overlay`）の操作をボタン化する（「ゲームに戻る」「タイトルへ戻る」）
- リザルト画面（`#result-screen`）に「タイトルへ戻る」ボタンを追加する
- タイトル画面を正常に再表示する（難易度ボタンが再操作可能な状態）

**Non-Goals:**

- タイトル画面の UI 変更
- ゲームの進行データや設定のリセット処理（タイトルから再スタートすれば自然にリセットされる）

## Decisions

### ポーズオーバーレイ全体クリックによる再開を廃止し、ボタン2つに置き換える

現在 `onPauseOverlayClick` でオーバーレイ全体のタップが再開トリガーになっているが、「タイトルへ戻る」ボタンを追加すると誤操作が生じるため廃止する。代わりに以下のボタンを `#pause-overlay` 内に追加する。

- **「ゲームに戻る」ボタン** (`#pause-resume-btn`): クリックでゲームを再開
- **「タイトルへ戻る」ボタン** (`#pause-return-title-btn`): クリックでタイトルへ戻る

`GameScene` 内の `onPauseOverlayClick` / そのリスナーを削除し、2つのボタン用リスナーに置き換える。

### 新イベント `kakutei:returnToTitle` を追加する

既存の `kakutei:startGame` / `kakutei:retryGame` パターンと同じ方式で、`kakutei:returnToTitle` カスタムイベントを新設する。

- ポーズ画面の「タイトルへ戻る」ボタン → `kakutei:returnToTitle` を発火
- リザルト画面の「タイトルへ戻る」ボタン → `kakutei:returnToTitle` を発火
- `main.ts` が受信して `game.scene.stop("GameScene")` を実行
- `TitleUI` が受信して `show()` を呼び出しタイトル画面を再表示

**採用理由**: 既存のイベントドリブンアーキテクチャと一貫性がある。UI 側と Phaser 側の責務が分離されたまま保たれる。

### TitleUI が `kakutei:returnToTitle` をリッスンして `show()` を呼ぶ

`main.ts` が直接 `#title-screen` を DOM 操作するのではなく、`TitleUI` 自身がイベントを受けて自己完結的に表示を制御する。

`show()` は内部で `container.innerHTML = ...` によってコンテナをリセットしてから `DifficultyButtons` を再生成するため、複数回呼ばれても状態が壊れない。

## Risks / Trade-offs

- `show()` の再呼び出しでコメントデータを `loadCommentsData()` が再取得する可能性がある。ただし `loadCommentsData` 内部でキャッシュが効いていれば問題ない → 実装時に確認する。
- ポーズ中に「タイトルへ戻る」を押した際、`#pause-overlay` が非表示にならないまま `kakutei:returnToTitle` が発火すると、次回ゲーム開始時に残留する恐れがある → `GameScene` のボタンハンドラで `#pause-overlay` を非表示にしてからイベントを発火する。

## Open Questions

- なし（ボタンのレイアウト・スタイリングはユーザーが後から調整する前提）
