# Design: issue-31-fix-scroll-stop-on-stone-hit

## Context

`GameScene` は `state` フィールドでゲームの進行状態を管理している。  
石ころ被弾イベント `onStoneHit` は `state === "playing"` の場合にのみ転倒シーケンスを起動するが、腰痛スロー中（`state === "back_pain_slow"`）も `update()` の通常パスで `checkStones()` が走るため、被弾は発生してもイベントハンドラが素通りし、スクロールが停止しない。

さらに `GameScene.onBackPainStart` の `delayedCall` 戻り値がフィールドに保持されていないため、石ころ被弾で状態が変わっても古いタイマーを明示的にキャンセルできない状態にある。

```
back_pain_slow 中の実際のフロー（修正前）

update()
  └─ checkStones() → player.triggerFall() ← Player 側は正常に fall を再生
                  → emit("stoneHit")

onStoneHit():
  if (state !== "playing") return;   ← back_pain_slow で早期リターン 🚫
  // stone_fall_coasting に遷移しない
  // ANIMATION_COMPLETE リスナーが未登録 → scroll.stop() が永遠に呼ばれない
```

## Goals / Non-Goals

**Goals:**

- `back_pain_slow` 状態中の石ころ被弾でも転倒シーケンスが正常に起動すること
- 腰痛タイマーを明示的にキャンセルし状態を整合させること
- `scrolledX > stageLength + 500` を超過した場合に強制 `game_over` で終了するセーフネットを追加すること

**Non-Goals:**

- `PlayerStateManager` の変更（Player 側の状態遷移はすでに正しい）
- 転倒後のスクロール速度の変更（`back_pain_slow` 由来でも slowed speed のまま coasting する）
- `stone_fall_coasting` 中のゴール通過処理（今回のスコープ外）

## Decisions

### Decision 1: `onStoneHit` のガード条件拡張

**選択：** `"playing"` に加えて `"back_pain_slow"` も通過させる

```typescript
// Before
if (this.state !== "playing") return;

// After
if (this.state !== "playing" && this.state !== "back_pain_slow") return;
```

**代替案：** stone hit を `update()` 内でも state ガードして `back_pain_slow` では呼ばない  
**却下理由：** `CollisionManager.checkStones()` の呼び出し側でガードすると判定の責務が分散する。イベントハンドラ側でまとめて受け入れ態勢を広げるほうが関心の分離として自然。

---

### Decision 2: GameScene に `backPainTimer` フィールドを追加してキャンセル

`Player.ts` にはアニメーション用の `backPainTimer` があるが、`GameScene` のスロー速度タイマー（`delayedCall`）は戻り値を捨てていた。

**選択：** `GameScene` に `private backPainTimer: Phaser.Time.TimerEvent | null = null` を追加し、`onBackPainStart` で保持、`onStoneHit` で明示的に `remove(false)` する

```typescript
// onBackPainStart
this.backPainTimer = this.time.delayedCall(slowDuration * 1000, () => { ... });

// onStoneHit（ガード後）
if (this.backPainTimer) {
  this.backPainTimer.remove(false);
  this.backPainTimer = null;
}
```

**なぜ必要か：** `delayedCall` のコールバック内では `state === "back_pain_slow"` かチェックするため、修正後は `stone_fall_coasting` になっているので素通りし実害はない。  
しかし**意図を明示する**ためにキャンセルする。将来的にコールバック内のチェックが変更されても安全が保たれる。

---

### Decision 3: セーフネットの実装場所

**選択：** `GameScene.update()` の先頭ガード直後に `scrolledX` チェックを追加する

```typescript
// stone_fall 以降は scrolledX が増加しないが、
// stone_fall_coasting 中は増加するため本チェックが機能する
if (this.scrolledX > this.difficulty.stageLength + 500) {
  this.onScrollOverrun();
  return;
}
```

**しきい値の根拠：** ゴールは `stageLength + 200` の worldX にある。正常なゴール到達で `scrolledX ≈ stageLength - 230`（`GAME_W/2 - 80 ≒ 230px` 分手前でゴール判定が発火）であり、`+500` はゴールより十分奥まで進んでもセーフネットが誤発動しない余裕をもたせた値。

**発動時の挙動：** `game_over` として扱い `ResultScene` へ遷移する（`onEnemyReached` と同じフロー）。

---

## Risks / Trade-offs

- **セーフネットの誤発動リスク:** しきい値 `+500` はゴール判定位置（`stageLength - 約230px`）と十分な余裕があるため、通常プレイで誤発動することはない。ただしステージ長が短い将来の難易度が追加された場合は再検討が必要。→ `difficultyConfig` でステージ長単位の検証は現時点では追加しない。
- **slowed speed のままの coasting:** `back_pain_slow` 由来の転倒では coasting 中のスクロール速度が slowed のままになる。意図的な設計決定（探索フェーズで確認済み）。

## Open Questions

- なし（探索フェーズで全決定済み）
