# Spec: return-to-title

## Requirement: タイトルへ戻る機能

ポーズ画面およびリザルト画面から、タイトル画面へ戻る手段を提供しなければならない（SHALL）。
タイトルへ戻る操作は `kakutei:returnToTitle` カスタムイベントを通じて実現される。

### Scenario: ポーズ中にタイトルへ戻る

- **WHEN** ポーズ中にプレーヤーが「タイトルへ戻る」ボタン（`#pause-return-title-btn`）を押す
- **THEN** `#pause-overlay` が非表示になる
- **AND** `kakutei:returnToTitle` イベントが `window` に発火される
- **AND** `GameScene` が停止される
- **AND** タイトル画面（`#title-screen`）が表示され、難易度ボタンが操作可能な状態になる

### Scenario: リザルト画面からタイトルへ戻る

- **WHEN** リザルト画面表示中にプレーヤーが「タイトルへ戻る」ボタン（`#result-return-title-btn`）を押す
- **THEN** `#result-screen` が非表示になる
- **AND** `kakutei:returnToTitle` イベントが `window` に発火される
- **AND** タイトル画面（`#title-screen`）が表示され、難易度ボタンが操作可能な状態になる
