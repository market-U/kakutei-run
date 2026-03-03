## Context

`Player` クラスは現在、アニメーション状態を `isBackPain` / `gameOver` / `grounded` などの複数のフラグで管理しており、明示的な状態機械を持たない。これにより以下のバグが発生している。

1. **ジャンプ着地後のアニメーション不再開**: `anims.stop()` を呼んでも `currentAnim.key` は残るため、`playAnim()` の同一キースキップ条件に引っかかり再生されない。
2. **石ころ着地後に player_fall でなく player_run が再生される**: `onLanded()` に `falling` ガードがなく、`triggerFall()` 後の物理着地で `player_run` が上書きされる。
3. **空中で魔女被弾後、着地でアニメーションが正しく戻らない**: `activateBackPain()` が地上想定で設計されており、空中被弾時の挙動が未定義。
4. **敵到達ゲームオーバー時に `gameOver` フラグが立たない**: `GameScene` が `player.anims.stop()` を直接呼ぶだけで、`Player` 自身が自分の終端状態を知らない。
5. **チャージ中 scaleY が変わった状態で他状態に遷移したとき等倍に戻らない**: `triggerFall()` / `triggerGoal()` で `setScale` リセットが行われていない。

---

## Goals / Non-Goals

**Goals:**

- `falling` フラグを導入し、`gameOver` と役割を分離する
- `onLanded()` / `activateBackPain()` / `triggerFall()` 等のガード条件を整理する
- `playAnim()` の同一キースキップ条件を修正し、`stop()` 後の再起動を可能にする
- 全状態遷移時に `setScale(1, 1)` でスプライト等倍をリセットする
- `triggerGoal()` を終端状態として `gameOver=true` にするとともに `player_goal` をループ再生に変更する
- 敵到達時に `Player.triggerEnemyCaught()` を新設し `gameOver=true` を立てる
- 既存テストが引き続きパスすることを確認する

**Non-Goals:**

- アニメーションフレームレート・HUD 表示の変更は含まない
- `GameScene.GameState` の管理には手を加えない
- スプライトアセット自体の差し替えはこのチェンジの対象外

---

## Decisions

### Decision 1: `falling` フラグの導入

`gameOver` が「ゲーム終了（入力・遷移を全て無効化）」を意味するのに対し、`falling` は「石ころ転倒アニメーション再生中（敵到達待ち）」を意味する。両者を分離することで、S5 中の着地・衝突イベントを適切にガードしつつ、その後の S7 遷移で `gameOver=true` に移行できる。

### Decision 2: `playAnim()` の修正方針

`anims.isPlaying` も確認する。同じキーであっても再生が停止している場合は `play()` を呼ぶ。

```typescript
// Before
if (this.anims.currentAnim?.key !== key) {
  this.play(key);
}
// After
if (this.anims.currentAnim?.key !== key || !this.anims.isPlaying) {
  this.play(key);
}
```

### Decision 3: scaleリセットの徹底

S1 / S2 のチャージ中以外では常に `setScale(1, 1)`（X/Y 両方）を保証する。
他状態への遷移時（`releaseJump` / `triggerFall` / `triggerGoal` / `triggerEnemyCaught`）の先頭で必ずリセットする。将来の scaleX 変更にも対応できるよう X も含める。

### Decision 4: S7 のアニメーション仕様

`triggerEnemyCaught()` 呼び出し時：

- `falling=false`（S1/S2/S3/S4 経由）→ `player_goal` をループ再生
- `falling=true`（S5 経由）→ アニメーションは変更しない（`player_fall` 最終フレーム固定のまま）

### Decision 5: S6 のアニメーション仕様

`player_goal` を `repeat: -1`（ループ）に変更する。

---

## 状態定義（確定版）

| ID | 状態名 | grounded | isBackPain | falling | gameOver |
|----|--------|----------|------------|---------|----------|
| S1 | running | true | false | false | false |
| S2 | back_pain_ground | true | true | false | false |
| S3 | jumping | false | false | false | false |
| S4 | jumping_back_pain | false | true | false | false |
| S5 | falling | * | * | true | false |
| S6 | goal | * | * | false | true |
| S7 | enemy_caught | * | * | false | true |

---

## スプライト表示（確定版）

| 状態 | スプライト | 再生モード | scaleY |
|------|-----------|-----------|--------|
| S1 | player_run | ループ | 1.0（チャージ中 0.7〜1.0） |
| S2 | player_back_pain | ループ | 1.0（チャージ中 0.7〜1.0） |
| S3 | 現在フレーム固定（run 途中） | ─ | 1.0 |
| S4 | back_pain frame 0 固定 | ─ | 1.0 |
| S5 | player_fall | 1回 → 最終フレーム固定 | 1.0 |
| S6 | player_goal | ループ | 1.0 |
| S7（S5経由） | player_fall 最終フレーム固定 | ─ | 1.0 |
| S7（その他経由） | player_goal | ループ | 1.0 |

---

## 状態遷移表（確定版）

イベント一覧：

| ID | イベント | 発生源 |
|----|---------|--------|
| E1 | SPACE↓ / pointerdown | 入力 |
| E2 | SPACE↑ / pointerup | 入力 |
| E3 | onLanded | Phaser Arcade collider |
| E4 | stoneHit | CollisionManager |
| E5 | witchHit | CollisionManager |
| E6 | backPainTimer 満了 | Player 内部タイマー |
| E7 | enemyReached | CollisionManager |
| E8 | goalReached | GameScene update() |

```text
         E1(charge) E2(jump) E3(onLanded) E4(stone) E5(witch) E6(timer) E7(enemy) E8(goal)
S1        ─          →S3      ─            →S5       →S2       ─         →S7       →S6
S2        ─          →S4      ─            →S5       ─(再セット) →S1       →S7       →S6
S3        ✗          ✗        →S1          →S5       →S4       ─(不発)   →S7       →S6
S4        ✗          ✗        →S2          →S5       ─(再セット) →S3       →S7       →S6
S5        ✗          ✗        ✗(ガード)    ✗(ガード) ✗(ガード) ─         →S7       ✗
S6        ✗          ✗        ✗(ガード)    ✗         ✗         ─         ✗         ✗
S7        ✗          ✗        ✗(ガード)    ✗         ✗         ─         ✗         ✗
```

補足：

- S3 + E5: `activateBackPain()` は `isBackPain=true` + `player_back_pain` frame 0 で止める → S4 へ
- S4 + E6: `isBackPain=false` になるだけ、sprite 不変 → S3 へ（次の着地で S1 へ）
- S5/S6/S7 + E3: `falling=true` または `gameOver=true` でガードし `onLanded()` を無視
- S6 + E3: ジャンプ中ゴール到達後、物理落下は継続し地面で止まる。`onLanded()` はガードするが物理挙動は Phaser に委ねる

---

## Risks / Trade-offs

- [リスク] `onLanded()` ガード追加により既存の `Player.test.ts` の着地テストが影響を受ける → テスト更新が必要
- [リスク] `player_goal` を `repeat: -1` に変更することで、アニメーション定義のテストがあれば変更が必要 → 確認する
- [リスク] `triggerEnemyCaught()` 新設により `GameScene.onEnemyReached()` の呼び出し側修正が必要
