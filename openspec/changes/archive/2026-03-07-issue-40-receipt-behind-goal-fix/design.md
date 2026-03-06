# design: issue-40-receipt-behind-goal-fix

## Context

`Receipt` と `Witch` はスクロール速度係数（`speedFactor`）を持ち、地面スクロールとのずれを `extraScrolledX` として毎フレーム累積する。
現状、累積はゲーム開始 t=0 から始まるため、ステージ後半に配置されたオブジェクトはプレイヤーが到達するまでの全時間分のドリフトを蓄積してしまう。

`scrollSpeed = 360 px/s`、`receiptSpeedFactorMin = 0.9` の場合、ドリフト量は `0.1 × worldX`。
hard 難易度（stageLength=10000）の maxX=9800 では最大 **980px** ずれる計算になり、ゴール（stageLength+200）の背後に完全に隠れる。

また、現在の `maxX = stageLength - 200` ではゴール（stageLength+200）まで **400px** しか余裕がなく、ゴール画像（税務署）と視覚的に重なりやすい。

## Goals / Non-Goals

**Goals:**

- ドリフト量を「フレームイン後の経過時間」に限定し、ステージ長に依存しない一定範囲に収める
- レシート・魔女の配置をゴールから 600px 以上離し、ゴール画像との重なりを防ぐ

**Non-Goals:**

- speedFactor の範囲変更（ドリフト演出は維持する）
- ゴールオブジェクトの depth・サイズ調整
- 石ころへの同様の修正（石ころは speedFactor を持たない）

## Decisions

### D1: フレームイン検出を `updateScroll` 内で行う

`_hasFramedIn` フラグを `Receipt` / `Witch` に追加し、`updateScroll` 内で `isVisible()` を使って検出する。
フレームインまでは `extraScrolledX` を累積せず、通常スクロールとして扱う。

**代替案**: `GameScene` 側でフレームイン管理 → クラス外部に状態が漏れるため不採用。

**効果**: フレームイン後のドリフト最大量 = `(1 - speedFactorMin) × canvasWidth = 0.1 × 960 = 96px`（ステージ長に依存しない）

### D2: maxX を `stageLength - 600` に変更

`MapGenerator.findPosition` の `maxX` を一律 400px 拡大する。
変更後のゴールまでの最小距離は 800px となり、96px のドリフトを考慮しても 700px 以上の余裕が生まれる。

**代替案**: タイプ別に maxX を分ける → 複雑さに見合う効果がないため不採用（stone は drift なし、witch は画面外から左に向かって来るため問題が異なる）。

## Risks / Trade-offs

- [ドリフト演出の変化] フレームイン前はドリフトしないため、画面右端から登場した瞬間からのドリフトのみ視覚に現れる。遠景での揺らぎは失われるが、gameplay への影響は軽微。→ 意図した挙動としてそのまま採用。
- [配置密度の低下] maxX 縮小でオブジェクト配置可能範囲が 400px 減少する。easy（stageLength=6000）では影響小。hard（10000px）でも 4%程度の縮小にとどまる。

## Open Questions

なし
