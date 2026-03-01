# Design: fix-goal-detection

## Context

`GameScene.ts` でゴール（税務署）の表示と判定に2つの不具合がある。

1. **表示位置のズレ**: 税務署スプライトを `setOrigin(0.5, 1)` で配置しているため本来は Y 座標が底辺を示すが、`GROUND_Y - 64` を渡しているため底辺が地面より 64px 上に浮いてしまっている。`GROUND_Y` を渡すことで底辺が地面に接地する。

2. **ゴール判定の状態漏れ**: `update()` 内のゴール到達チェックが `state === "playing"` のときのみ発火する。`back_pain_slow` 状態（魔女被弾後のスロー中）でゴールに到達した場合は判定されず素通りしてしまう。

## Goals / Non-Goals

**Goals:**

- 税務署スプライトを地面に正しく接地させる
- `back_pain_slow` 状態でもゴール判定が発火するようにする

**Non-Goals:**

- ゴール判定方式の変更（現行の X 座標チェックを維持する）
- 税務署のスプライトサイズや見た目の変更

## Decisions

### 税務署の Y 座標修正

`GROUND_Y - 64` → `GROUND_Y` に変更する。`setOrigin(0.5, 1)` により Y は底辺基準のため、`GROUND_Y` を渡すことでスプライト底辺が地面上端に揃う。

### ゴール判定の条件拡張

現在の条件:

```text
this.state === "playing"
```

変更後:

```text
this.state === "playing" || this.state === "back_pain_slow"
```

`stone_fall` / `game_over` / `cleared` はすでに `update()` 冒頭で早期 return されるため、追加しなくてよい。

## Risks / Trade-offs

- [軽微] `back_pain_slow` 中にクリアになった場合、スロー演出の途中でクリアシーケンスに入る。→ クリア時に `scrollManager.stop()` と `player.triggerGoal()` が呼ばれるため見た目上の問題は少ない。許容範囲とする。
