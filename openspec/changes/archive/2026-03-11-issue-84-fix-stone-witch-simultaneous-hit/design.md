# Design: issue-84-fix-stone-witch-simultaneous-hit

## Context

`GameScene.update()` の衝突判定は同一フレーム内で 4 つのチェックを順番に実行する。

```text
checkStones()        ← 石ころ被弾 → _falling=true, player_fall 開始
                        emit("stoneHit") → onStoneHit() → state="stone_fall_coasting"
                        .once("animationcomplete-player_fall", callback) 登録
checkWitches()       ← 同フレームで実行される（state 再チェックなし）
                        witch.consume() + player.activateBackPain()
                        → ps.activateBackPain(): _falling=true でも "none" を返さない！
                        → grounded なら playAnim("back_pain") が呼ばれ player_fall が上書き
                        → 空中なら play("player_back_pain"); anims.stop() で player_fall が停止
checkReceipts()
checkEnemyReached()
```

結果として `animationcomplete-player_fall` イベントが永遠に発火せず、
ゲームが `stone_fall_coasting` のまま走り続け、フェールセーフ（scrolledX > stageLength + 500）
が発動するまで石・ゴールの当たり判定が失われる。

既存の `player-mechanics` spec「転倒中の着地・衝突イベント無視（S5）」では
魔女接触は S5 では無視されると定義されていたが、実装の `PlayerStateManager.activateBackPain()`
に `_falling` ガードが存在しないため、同フレーム内の遷移では仕様が守られていなかった。

## Goals / Non-Goals

**Goals:**

- `_falling=true` の状態では `activateBackPain()` が "none" を返すようにし、
  魔女被弾によるアニメーション変更・腰痛発動を無効化する
- 既存の spec「転倒中の着地・衝突イベント無視（S5）」の実装を正しく保証する
- 石ころ・魔女の同時被弾時に `player_fall` が確実に最終フレームまで再生されることを保証する

**Non-Goals:**

- 衝突判定の実行順序変更（CollisionManager の構造変更は行わない）
- `GameScene.update()` へのフレーム内 state 再チェック追加
- `CollisionManager.checkWitches()` のガード追加（ドメインロジックは PlayerStateManager に集約する）
- 石ころと魔女の配置制約変更（マップジェネレーターへの手は入れない）

## Decisions

### Decision 1: 修正箇所を `PlayerStateManager.activateBackPain()` とする

**選択**: `PlayerStateManager.activateBackPain()` に `_falling` チェックを追加する。

```typescript
activateBackPain(): AnimAction {
  if (this._gameOver || this._falling) return "none"; // _falling を追加
  this._isBackPain = true;
  ...
}
```

**理由**:

- `PlayerStateManager` がプレーヤーの状態遷移の唯一の真実の源（single source of truth）である
- `_falling=true` 中は「転倒中は無敵」という既存の設計意図に合致する
- `CollisionManager` や `GameScene` に guard を追加するより、state machine レイヤーで解決する方が責務が明確
- `Player.activateBackPain()` は `ps.activateBackPain()` が "none" を返せば既存のガード（`if (action === "none") return;`）で後続処理をすべてスキップする。追加実装不要。

**代替案（却下）**:

- `CollisionManager.checkWitches()` でプレーヤーの falling 状態を確認してから `activateBackPain()` を呼ぶ
  → CollisionManager をゲーム状態に依存させることになり、責務が不明確になる
- `GameScene.update()` の衝突ループで stone hit 後に state を再チェックして witch をスキップする
  → フレーム内の state 変更に依存した脆弱な実装になる

### Decision 2: 魔女オブジェクトは転倒中でも消費する

`witch.consume()` は `CollisionManager.checkWitches()` 内で `activateBackPain()` の前に実行されるため、
`_falling` ガードの有無に関わらず魔女は消費済みになる。この挙動は変更しない。

**理由**:

- 転倒中に魔女を「スルー」させると、転倒後に同じ魔女に再び被弾する可能性が生じる
- 魔女はプレーヤーが通過した位置から消えるという視覚的一貫性を保てる

## Risks / Trade-offs

- **ゲームバランスへの微小な影響**: 石ころ直後に魔女が来る配置で、魔女ペナルティが発生しなくなる。
  ただし転倒中は無敵というゲームの設計意図と一致しており、意図的な仕様変更として許容できる。
  → Mitigation: 既存の `obstacles` spec・`player-mechanics` spec に明記する。

- **再現テスト**: 石ころと魔女を同一 worldX に意図的に配置してデバッグ確認すること。
  → Mitigation: tasks に再現確認ステップを含める。
