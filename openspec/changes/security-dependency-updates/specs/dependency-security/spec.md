# 依存関係のセキュリティ検証

## ADDED Requirements

### Requirement: 修正済み依存関係の検証

依存関係の脆弱性対応では、開発依存を含めて npm audit の検出件数が0件になることを MUST とする。

#### Scenario: 依存関係の脆弱性を修正した場合

- **WHEN** 対応後の package-lock.json に対して npm audit を実行する
- **THEN** 検出件数が0件で終了コードが0になる

### Requirement: 開発環境の再現性と互換性

依存更新後は、サポートする Node.js 環境で npm ci、既存テスト、型チェックを含む本番ビルドが成功することを MUST とする。

#### Scenario: CI と同じ Node.js 22 系で検証する場合

- **WHEN** Node.js 22.12.0 以上の22系で npm ci、npm test、npm run build を実行する
- **THEN** 各コマンドが成功し、既存のゲームテストに失敗がない
