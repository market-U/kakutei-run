# Spec: receipt-scoring (delta)

## MODIFIED Requirements

### Requirement: レシートの収集

レシートは地面または空中に配置されるアイテムであり、プレーヤーが触れると収集される。

#### Scenario: 地面のレシートを収集

- **WHEN** プレーヤーのコライダーが地面に配置されたレシートのコライダーと重なる
- **THEN** レシートが消え、収集数が1増加する

#### Scenario: 空中のレシートを収集

- **WHEN** プレーヤーがジャンプ中に空中のレシートのコライダーと重なる
- **THEN** レシートが消え、収集数が1増加する

#### Scenario: レシートの移動速度

- **WHEN** レシートが画面にフレームインする（`isVisible()` が初めて true になる）
- **THEN** そのレシートは地面スクロール速度の `receiptSpeedFactorMin`〜`receiptSpeedFactorMax` 倍のランダム速度でドリフトを開始する
- **AND** フレームイン前はドリフトなしで通常スクロールに従う

#### Scenario: レシートの出現高さ

- **WHEN** レシートが配置される
- **THEN** 出現高さは `receiptYMin`〜`receiptYMax` の範囲でランダムに決定される

#### Scenario: レシート同士の重複配置防止

- **WHEN** レシートがステージに配置される
- **THEN** 既存のレシートとの直線距離がすべて `objectMinDistance` 以上になるよう配置される（配置時点のチェックのみ。移動後の重なりは許容する）

#### Scenario: レシートと魔女の近接配置防止

- **WHEN** レシートがステージに配置される
- **THEN** 既存の魔女との直線距離がすべて `objectMinDistance` 以上になるよう配置される（配置時点のチェックのみ。移動後の重なりは許容する）
