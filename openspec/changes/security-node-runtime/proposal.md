# Node.js のセキュリティ更新

## Why

2026-10-21 の Node.js セキュリティリリースで DNS、TLS、Brotli などの脆弱性が修正された。開発シェルの24.14.0と直近 CI の22.23.3は修正前であり、開発からデプロイまでの実行環境を更新する必要がある。

## What Changes

- 開発用の Node.js 24 系を修正済み24.22.1以降へ更新し、現在24.14.0を指している nvm の default エイリアスも更新する。このリポジトリでは .nvmrc により検証済み22.23.4を選択できるようにする。既存の他の Node.js バージョンは削除しない。
- package.json の対応範囲を22.23.4以上の22系、または24.22.1以上の24系に限定し、未検証のメジャーを自動的に許容しない。
- CI は .nvmrc を参照し、キャッシュされた22.23.3へ戻らないようにする。
- actions/checkout と actions/setup-node を Node.js 24 ランタイムの v6 へ更新する。アクション内蔵ランタイムのパッチ管理は GitHub 側の責任範囲として記録する。
- クリーンインストール、既存テスト、本番ビルド、実行バージョンを検証し、Node 本体の監査は npm audit の対象外であることを明記する。
- 本番は静的配信、Azure 側アプリビルドは skip_app_build により無効という構成を記録する。Azure のデプロイ用コンテナ内部の全 Node バージョンはログから確定できないため、確認済み範囲と区別する。

## Capabilities

### New Capabilities

- `node-runtime-security`: Node.js の修正済みバージョンの選択と CI・開発環境の検証要件。

### Modified Capabilities

なし。

## Impact

.nvmrc、package.json、package-lock.json、README、GitHub Actions ワークフローと開発機の nvm 管理下の Node.js が対象。ゲーム本体と Azure の本番配信方式は変更しない。

専用ブランチは feature/security-node-runtime。依存更新の PR #94 は未マージのため、両方の変更が共存するよう調整し、最終的な統合状態でも検証する。

## 調査根拠

- [Node.js セキュリティ情報](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)
- [Node.js 22.23.4](https://nodejs.org/en/blog/release/v22.23.4)
- [Node.js 24.22.1](https://nodejs.org/en/blog/release/v24.22.1)
- [直近の CI 実行ログ](https://github.com/market-U/kakutei-run/actions/runs/40605237474): Node.js 22.23.3、Oryx のアプリビルドをスキップ。
- [setup-node](https://github.com/actions/setup-node) と [checkout](https://github.com/actions/checkout) の公式定義。
