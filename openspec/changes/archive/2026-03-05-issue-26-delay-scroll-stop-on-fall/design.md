# Design: issue-26-delay-scroll-stop-on-fall

## Context

現在、プレーヤーが石ころに躓いた瞬間に `GameScene.onStoneHit()` が `scrollManager.stop()` を即呼び出す。
そのため `player_fall` アニメーション（5フレーム × 10fps = 約500ms）が再生されている間も背景が静止しており、
プレーヤーがその場でずっこけるように見える。

関連する現在の処理フロー：

```text
CollisionManager.checkStones()
  └─ player.triggerFall()
  └─ enemy.startChasing()    ← CollisionManager が直接呼んでいる
  └─ scene.events.emit("stoneHit")

GameScene.onStoneHit()
  ├─ state = "stone_fall"
  └─ scrollManager.stop()   ← 即停止（問題箇所）

update()
  ├─ state === "stone_fall" → early return
  └─ scrollManager.update() が呼ばれない
```

## Goals / Non-Goals

**Goals:**

- 石ころ被弾後、`player_fall` アニメーション完了まで背景スクロールを継続する
- スクロール停止後に敵の追跡を開始する（相対速度として敵が近づく）
- 転倒アニメーション中と非中の処理を明確に分離する

**Non-Goals:**

- スクロール速度の減速（イージング）は行わない。即停止のままで、タイミングのみ変更する
- 敵の追跡速度や追跡ロジックは変更しない
- スクロール継続中の当たり判定（他の石ころや魔女）は既存の `stone_fall_coasting` 中 early return で自然に無効化される

## Decisions

### Decision 1: 新状態 `"stone_fall_coasting"` の追加

**選択**: `GameState` に `"stone_fall_coasting"` を挟む

```text
playing
  │ (stoneHit)
  ▼
stone_fall_coasting   ← 新状態
  ・スクロール継続（通常速度）
  ・enemy は現位置維持
  ・jump 不可
  │ (animationcomplete-player_fall)
  ▼
stone_fall            ← 既存（スクロール停止・enemy 追跡開始）
```

**理由**: 既存の `stone_fall` 状態・処理を保持したまま遷移タイミングのみ変更できる。スクロール停止と敵追跡開始が同時に起きるというゲームロジックの不変条件を崩さない。

**代替案（却下）**:

- タイマー遅延（`time.delayedCall(500, ...)`）: アニメーション fps 変更に追従できない
- スクロール速度の段階的減速: スコープが広がるため今回は対象外

### Decision 2: `enemy.startChasing()` の呼び出し元を GameScene に移動

**選択**: `CollisionManager.checkStones()` から `enemy.startChasing()` を削除し、`GameScene` 側の `animationcomplete` コールバック内で呼び出す

**理由**:
- 「スクロール停止と同時に敵が追走を開始する」というロジックの一貫性を保つ
- `CollisionManager` は衝突検知のみを担当し、ゲーム状態遷移のトリガーは `GameScene` に集約する（関心の分離）

### Decision 3: `update()` ループの分岐拡張

`stone_fall_coasting` 中の処理：

```text
update() での stone_fall_coasting 処理:
  ├─ scrollManager.update(delta)  → 背景スクロール継続
  ├─ scrolledX 更新               → ワールドオブジェクト位置を正しく保つ
  ├─ 各ワールドオブジェクトの updateScroll 呼び出し
  └─ collision.checkEnemyReached() → 万一に備えてチェック継続
```

プレーヤー入力・新規衝突判定は行わない（`player.update()` および `collision.checkStones()` は呼ばない）。

## Risks / Trade-offs

- **`animationcomplete` の未発火リスク** → Phaser の `animationcomplete-<key>` イベントは `repeat: 0` のアニメーションが完了したとき確実に発火する。万一発火しない場合はゲームが `stone_fall_coasting` のまま詰まる。
  → Mitigation: イベントを `once` で登録する。将来的なタイムアウトフォールバックは v2 で検討。

- **`stone_fall_coasting` 中にワールドが存在しても衝突しない** → 複数石ころが連続配置の場合に2枚目の石に気づかず通過することになるが、これはゲームとして問題ない（転倒中は無敵扱い）。

## Open Questions

（なし）
