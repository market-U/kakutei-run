# specs: issue-19-enlarge-enemy — assets

## ADDED Requirements

### Requirement: 敵スプライトのフレームサイズ

敵キャラクターのスプライトシートは他キャラクターより大きなフレームサイズで管理される。

#### Scenario: 敵スプライトシートのフレームサイズ

- **WHEN** BootScene で敵スプライトシートが読み込まれる
- **THEN** フレームサイズは幅 96px、高さ 144px で登録される（SHALL）
- **AND** `FrameSize.ENEMY` 定数が `{ width: 96, height: 144 }` を返す

#### Scenario: 敵スプライトシートファイルの寸法

- **WHEN** `public/assets/sprites/enemy_run.png` が配置される
- **THEN** ファイルは 6 フレーム横並びのスプライトシートで、全体幅 576px（96×6）、高さ 144px でなければならない（SHALL）
