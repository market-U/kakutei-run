## 1. デグレ調査

- [x] 1.1 アーカイブ済み changes（`openspec/changes/archive/`）の tasks.md を確認し、`onWitchHit` / ゲームオーバー関連の変更が含まれる change を特定する
- [x] 1.2 特定した change の実装コミットを `git log` で確認し、バグ混入のコミットを特定してコメントまたはコミットメッセージに記録する

## 2. バグ修正

- [x] 2.1 `src/scenes/GameScene.ts` の `onWitchHit()` メソッドから `if (hitCount >= 3) { this.onEnemyReached(); }` ブロックを削除する
- [x] 2.2 `onWitchHit()` メソッドに、ゲームオーバーは `CollisionManager.checkEnemyReached()` の接触判定に委ねる旨のコメントを追加する

## 3. テスト・検証

- [x] 3.1 既存テスト（`vitest`）がすべて通ることを確認する（`npm test`）
- [x] 3.2 魔女3回被弾後、Enemy が追いつくまでゲームオーバーにならないことをブラウザで手動確認する
- [x] 3.3 魔女3回被弾後に Enemy が追いついた場合にゲームオーバーになることをブラウザで手動確認する
