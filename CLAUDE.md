# CLAUDE.md

- 常に日本語でやり取りしてください。
- このプロジェクトは **openspec** を採用しています。バグ修正・機能追加などコードへの変更作業は、必ず openspec のワークフロー（propose → apply → archive）に従って進めてください。ユーザが修正方法を一緒に考えたがっている場合は explore から開始してください。
- プロジェクトの構造については `openspec/config.yaml` を参照してください。
- openspec のスキル（propose / apply / archive など）を実行する際は、`openspec/config.yaml` の `git_workflow` セクションに定義された git ワークフロールールを必ず適用してください。
- markdown ファイルを生成する際は、`openspec/config.yaml` の `generation_rules` セクションに定義されたルールを必ず適用してください。

## OpenSpec スキルの実行方法

各スキルの手順は `.github/skills/` 配下の `SKILL.md` に定義されています。
以下の操作を依頼する際は、対応する SKILL.md を読んでから実行してください。

| 操作 | 参照先 |
|------|--------|
| 新しい変更の提案 (propose) | `.github/skills/openspec-propose/SKILL.md` |
| 変更の実装 (apply) | `.github/skills/openspec-apply-change/SKILL.md` |
| 変更のアーカイブ (archive) | `.github/skills/openspec-archive-change/SKILL.md` |
| コードベースの探索 (explore) | `.github/skills/openspec-explore/SKILL.md` |
