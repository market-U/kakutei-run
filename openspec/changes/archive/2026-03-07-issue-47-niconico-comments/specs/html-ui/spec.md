# Spec: html-ui

## ADDED Requirements

### Requirement: コメントトグルボタン

ゲームプレイ中の HUD にコメント表示の ON/OFF を切り替えるボタンを設けなければならない（SHALL）。
ボタンは `pause-btn` と同様に HTML 要素として実装し、ゲームプレイ中のみ表示される。

#### Scenario: コメントトグルボタンの表示

- **WHEN** ゲームプレイが開始される（HUD が表示される）
- **THEN** コメントトグルボタンが `pause-btn` と並んで画面上部に表示される

#### Scenario: コメントトグルボタンの非表示

- **WHEN** ゲームが終了し HUD が非表示になる
- **THEN** コメントトグルボタンも合わせて非表示になる

#### Scenario: OFF 状態の視覚フィードバック

- **WHEN** コメントが OFF 状態である
- **THEN** ボタンの透明度が下がり（例: opacity: 0.4）OFF であることが視覚的に判別できる
