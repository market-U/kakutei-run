# design: issue-9-buffered-jump-charge

## Context

現在の `Player.startCharge()` は `!this.ps.grounded` の場合に即リターンしており、
空中での入力は完全に破棄される。そのため、ジャンプ中に次のジャンプ入力を始めても
着地後に何も起こらず、連続ジャンプを意図した操作が実現できない。

`PlayerStateManager` は Phaser 非依存の純粋クラスとして設計されており、
単体テストが可能な状態管理の責務を担っている。

## Goals / Non-Goals

**Goals:**

- 空中での入力をバッファリングし、着地時刻からチャージを開始する
- スペースキーとタッチの挙動を統一する
- バッファロジックを `PlayerStateManager` に閉じ込め、単体テスト可能にする

**Non-Goals:**

- 多重ジャンプ（二段ジャンプ）の実現
- バッファの有効期限（着地後 N ms 以内でないとキャンセル、など）

## Decisions

### 決定1: バッファ状態を `PlayerStateManager` に持つ

**選択**: `PlayerStateManager` に `pendingChargeOnLand` フラグを追加する。

**理由**: Phaser 非依存の純粋ロジックであり、既存の設計方針と一致する。
`Player.ts` に持つ場合と比較して、単体テストで挙動を検証できる利点がある。

**代替案**: `Player.ts` のフィールドとして持つ → テスト不可、却下。

---

### 決定2: `onLanded()` の API を変えない

**選択**: 着地バッファの消費は `consumePendingCharge()` という独立メソッドで行う。

```
// Player.ts の onLanded() 内
const action = this.ps.onLanded();           // 既存のまま（AnimAction を返す）
const shouldCharge = this.ps.consumePendingCharge(); // フラグを読んで即クリア
if (shouldCharge && !this.jumpDisabled) {
  this.chargeStartTime = this.scene.time.now;
}
```

**理由**: `onLanded()` の返り値型（`AnimAction`）を変更すると呼び出し元が破壊的変更の影響を受ける。
独立メソッドにすることで責務が分離され、テストも書きやすい。

**代替案**: `onLanded()` の返り値をオブジェクト `{ animAction, startCharge }` に変更 → 既存 API 破壊、却下。

---

### 決定3: チャージ開始時刻は「着地した瞬間」

**選択**: `chargeStartTime = this.scene.time.now`（着地コールバック内）で記録する。

**理由**: Issue #9 の要件「着地時タイミングからジャンプチャージ開始」に明示されている通り。
空中で押した時刻からカウントすると着地前にフルチャージが確定してしまい、意図しない高ジャンプになる。

---

### 決定4: バッファのクリア箇所

以下のすべての箇所で `_pendingChargeOnLand = false` にする：

| タイミング | メソッド | 理由 |
|-----------|---------|------|
| 空中でリリース | `onReleaseInAir()` | 明示的キャンセル |
| 着地してチャージ消費 | `consumePendingCharge()` | 消費済み |
| 転倒 | `triggerFall()` | ゲーム進行終了 |
| ゴール | `triggerGoal()` | ゲーム進行終了 |
| 敵到達 | `triggerEnemyCaught()` | ゲーム進行終了 |

`jumpDisabled` 時は `Player.ts` 側で `consumePendingCharge()` の結果を無視する（`PlayerStateManager` はフラグを消費するが実際にはチャージ開始しない）。

## Risks / Trade-offs

- **[リスク] 着地判定のフレームタイミング** → `onLanded()` は `GameScene` の `collider` コールバックから呼ばれるため、`scene.time.now` は着地フレームの時刻となり問題ない。
- **[トレードオフ] consumePendingCharge() の呼び出し漏れ** → `onLanded()` のたびに必ず呼ぶ設計にする（true/false に関わらず）。着地処理の実装上、呼び忘れがないようにする。
