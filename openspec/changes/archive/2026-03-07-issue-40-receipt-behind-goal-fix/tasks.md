# tasks: issue-40-receipt-behind-goal-fix

## 1. フレームイン後ドリフト開始（Receipt）

- [x] 1.1 `Receipt` に `_hasFramedIn` フラグを追加する
- [x] 1.2 `updateScroll` をフレームイン前はドリフト累積しない実装に変更する

## 2. フレームイン後ドリフト開始（Witch）

- [x] 2.1 `Witch` に `_hasFramedIn` フラグを追加する
- [x] 2.2 `updateScroll` をフレームイン前はドリフト累積しない実装に変更する

## 3. MapGenerator の配置範囲修正

- [x] 3.1 `findPosition` の `maxX` を `stageLength - 600` に変更する
- [x] 3.2 `MapGenerator.test.ts` の配置範囲テストを `stageLength - 600` に更新する
