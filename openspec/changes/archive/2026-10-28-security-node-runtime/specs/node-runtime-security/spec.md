# Node.js 実行環境のセキュリティ

## ADDED Requirements

### Requirement: 修正版 Node.js の選択

開発と CI のアプリ用 Node.js は、2026-10-21 のセキュリティ修正版22.23.4以上の22系、または24.22.1以上の24系を使用することを MUST とする。

#### Scenario: 開発者がリポジトリ指定版を選択する

- **WHEN** nvm install と nvm use を実行する
- **THEN** .nvmrc の22.23.4が選択される

#### Scenario: CI が実行される

- **WHEN** ビルドとデプロイのワークフローを開始する
- **THEN** .nvmrc に基づいて22.23.4を選択し、実行バージョンをログに出力する

### Requirement: アプリとアクション実行環境の区別

GitHub Actions 自体は Node.js 24 ランタイムを利用する公式アクションへ更新し、アプリ用 Node.js とは別に管理することを MUST とする。

#### Scenario: ソース取得と Node.js セットアップ

- **WHEN** checkout と setup-node を実行する
- **THEN** それぞれ Node.js 24 ランタイムを指定する v6 を利用する

### Requirement: 更新後の統合検証

修正版22系・24系でクリーンインストール、既存テスト、本番ビルドを成功させることを MUST とする。

#### Scenario: Node.js 更新後の検証

- **WHEN** 22.23.4と24.22.1で npm ci、npm test、npm run build を実行する
- **THEN** すべて成功し、npm audit の依存関係の検出も0件となる
