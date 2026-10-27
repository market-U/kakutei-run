# 開発依存関係の更新設計

## Context

Vite 6 系と Vitest 2 系、および間接依存に既知の脆弱性がある。CI は Node.js 22 系を利用し、Tailwind CSS の Vite プラグインは Vite 7 に対応している。

## Goals / Non-Goals

既知の依存関係の脆弱性を解消し、既存のゲームテストと本番ビルドを維持する。ゲームの仕様変更は対象外とする。

## Decisions

- Vite は 7.3.7、Vitest は 4.1.12 を下限に更新する。Vite 6 系には現時点の監査で残る問題があり、Vite 7 は既存 Tailwind プラグインの対応範囲内である。Vitest 4 は修正済み mocker を含み、脆弱な tinypool に依存しない。
- 間接依存は既存の許容範囲で修正済み版へ更新し、不要な overrides は追加しない。
- Node.js は CI と合わせて 22.12.0 以上の 22 系、または 24 系以降を利用する。package.json と README に明記する。
- npm ci 後に npm test、npm run build、npm audit を実行し、可能なら CI と同じ Node.js 22 系でも確認する。

## Risks / Trade-offs

- メジャー更新による互換性問題 → 既存テストと型チェックを含むビルドで検証する。
- GitHub のアラートは develop 上で継続表示される → PR に監査結果を記載し、マージ後に再評価されることを明記する。

## Migration Plan

package.json とロックファイルを同時に更新する。問題がある場合は対応コミットを revert し、従来のロックファイルで npm ci を実行する。

## Open Questions

なし。
