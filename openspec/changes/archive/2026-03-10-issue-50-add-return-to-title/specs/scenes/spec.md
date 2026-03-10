# Spec: scenes (delta)

## MODIFIED Requirements

### Requirement: HTML UI レイヤー

タイトル・リザルト・HUD は Phaser シーンではなく、HTML/CSS の UI レイヤーとして実装する。Phaser と HTML の間はカスタムイベントで疎結合に通信する。

| イベント名 | 発火元 | 受信先 | ペイロード |
|---|---|---|---|
| `kakutei:assetsLoaded` | BootScene | TitleUI | なし |
| `kakutei:startGame` | TitleUI | main.ts | `{ difficultyId }` |
| `kakutei:gameResult` | GameScene | ResultUI | `{ result, collected, total, difficultyId, shareComment, distance }` |
| `kakutei:retryGame` | ResultUI | main.ts | `{ difficultyId }` |
| `kakutei:returnToTitle` | PauseUI / ResultUI | main.ts, TitleUI | なし |
| `kakutei:orientationChanged` | OrientationManager | GameScene | `{ orientation }` |

#### Scenario: タイトル画面の表示

- **WHEN** `kakutei:assetsLoaded` イベントが発火する
- **THEN** `#title-screen` が表示され、難易度選択ボタンとスタートボタンが操作できる状態になる

#### Scenario: ゲーム開始

- **WHEN** プレーヤーがスタートボタンを押す
- **THEN** `kakutei:startGame` イベントが `{ difficultyId }` とともに発火し、Phaser の GameScene が起動する

#### Scenario: リザルト画面の表示

- **WHEN** `kakutei:gameResult` イベントが発火する
- **THEN** `#result-screen` が表示され、結果・レシート回収率・走行距離・SNSシェアボタン・リトライボタン・タイトルへ戻るボタンが表示される

#### Scenario: 難易度を変えてリトライ

- **WHEN** プレーヤーがリトライボタンから難易度を選択してリトライする
- **THEN** `kakutei:retryGame` イベントが `{ difficultyId }` とともに発火し、GameScene が指定難易度で再起動する

---

### Requirement: ポーズ機能

ゲームプレイ中はいつでもポーズできなければならない（SHALL）。

#### Scenario: ポーズボタンによるポーズ

- **WHEN** ゲームプレイ中にプレーヤーがポーズボタン（`#pause-btn`）を押す
- **THEN** ゲームスクロールが一時停止し、`#pause-overlay` が表示される

#### Scenario: 端末回転によるポーズ

- **WHEN** GameScene がアクティブ中に `kakutei:orientationChanged` イベントが発火する
- **THEN** ゲームスクロールが一時停止し、`#pause-overlay` が表示される

#### Scenario: ポーズ解除ボタンによる再開

- **WHEN** ポーズ中にプレーヤーが「ゲームに戻る」ボタン（`#pause-resume-btn`）を押す
- **THEN** ゲームスクロールが再開し、`#pause-overlay` が非表示になる

#### Scenario: オーバーレイ全体クリックによる再開の廃止

- **WHEN** ポーズ中にプレーヤーが `#pause-overlay`（ボタン以外の領域）をタップする
- **THEN** ゲームは再開しない
