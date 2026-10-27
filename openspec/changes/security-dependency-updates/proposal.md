# 開発依存関係の脆弱性対応

## Why

develop の Dependabot に未解決の脆弱性アラートが16件あり、npm audit でも重大度 critical を含む10パッケージが検出されている。開発サーバーとテスト基盤の既知の脆弱性を解消する。

## What Changes

- Vite と Vitest を修正済みの互換性のあるバージョンへ更新する。候補は Vite 7 系と Vitest 4.1.12 以降とし、監査結果と既存テストで確定する。
- PostCSS、nanoid、picomatch、source-map-js などの間接依存を修正済みバージョンへ更新し、package-lock.json に固定する。
- **BREAKING**: 開発ツールのメジャー更新に伴い、必要な Node.js バージョンを確認・明記する。既存 CI の Node.js 22 系との互換性を検証する。
- クリーンインストール、既存テスト、型チェックを含む本番ビルド、npm audit で検証する。

## Capabilities

### New Capabilities

追加なし。開発依存関係の保守更新として扱う。

### Modified Capabilities

変更なし。ゲームの既存要件は変更しない。

## Impact

主な変更対象は package.json と package-lock.json。必要に応じて開発環境の説明とツール設定を更新する。未追跡の docs/ は変更・コミット対象から除外する。
GitHub のアラート解消は develop へのマージ後に再評価されるため、対応ブランチでは更新後の依存ツリーと監査結果を確認する。
