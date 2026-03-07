# Design: ScrollableSprite 抽象クラスによる共通化

## Context

`Witch`（`Phaser.GameObjects.Sprite` を継承）と `Receipt`（`Phaser.GameObjects.Image` を継承）は、
それぞれ独立したクラスとして実装されているが、以下のフィールドとメソッドが完全に重複している。

- フィールド: `worldX`, `worldY`, `speedFactor`, `extraScrolledX`, `_hasFramedIn`
- メソッド: `updateScroll(scrolledX, scrollSpeed, delta)`

また、`Receipt` が `Image` を使っているため、継承ツリーが Witch と異なり、共通基底クラスを作りにくい状態になっている。

## Goals / Non-Goals

**Goals:**

- `updateScroll` ロジックとそれに紐づくフィールドを1か所に集約する
- `Receipt` を Sprite ベースに統一し、将来アニメーションを追加できる状態にする
- レシートアセットを3種から1種に整理する

**Non-Goals:**

- ゲームの挙動・UX の変更
- `Stone` など他オブジェクトへの適用（まず Witch/Receipt のみ対象）
- `isVisible()` や `getHitBounds()` の共通化（オブジェクトごとに数値が異なるため各クラスに残す）

## Decisions

### Decision 1: Mixin ではなく abstract class を採用する

**採用:** `abstract class ScrollableSprite extends Phaser.GameObjects.Sprite`

**却下:** TypeScript の Mixin パターン（`function ScrollableMixin<T>(Base: T)`）

**理由:**
- `Receipt` を Sprite に変換する方針が決まったため、継承ツリーの統一が可能になった
- abstract class は IDE サポート・可読性・型安全性のいずれも Mixin より優れる
- Mixin は基底クラスが異なる場合の苦肉の策であり、今回は不要

### Decision 2: Receipt を Image から Sprite へ変更する

**採用:** `Receipt extends ScrollableSprite`（= `Phaser.GameObjects.Sprite` ベース）

**理由:**
- `Phaser.GameObjects.Sprite` は `Image` のスーパーセットであり、静止表示も問題なく行える
- 1フレームのスプライトシートとして管理することで、将来のアニメーション追加がゼロコストになる
- 今回同時にアセットを1種に整理するため、ランダム選択ロジックの削除と組み合わせてコードがシンプルになる

### Decision 3: レシートアセットを1種に統合する

**採用:** `receipt_1.png` を `receipt.png` にリネームし、`receipt_2.png` / `receipt_3.png` を削除する

**理由:**
- 現状3種のファイルは実質的に同一画像のため、ゲームへの影響は一切ない
- 1種に統合することで、受け渡すキーのランダム選択ロジックが不要になり、Receipt の constructor がシンプルになる
- `AssetKeys.RECEIPT_1/2/3` の3定数が `AssetKeys.RECEIPT` の1定数に集約され、管理コストが下がる

### Decision 4: `_consumed` / `_collected` の命名は各クラスに残す

**採用:** Witch は `_consumed` / `isConsumed()`、Receipt は `_collected` / `isCollected()` のまま

**理由:**
- 2つの「消費済み」状態はドメイン的な意味が異なる（衝突消滅 vs. 収集）
- 共通基底に `_inactive` などで抽象化すると、各クラスを読む際に意味が薄れる
- ScrollableSprite は「スクロール連動」に関心を絞り、「状態管理」は各サブクラスの責務とする

## Risks / Trade-offs

- `Receipt` が Image から Sprite になることで `displayWidth` / `displayHeight` の挙動が変わる可能性がある
  → Phaser 3 では Sprite も Image と同様にテクスチャのサイズを返すため、実質的な影響なし。実装後にビルド確認で検証する
- `load.spritesheet` への変更により、フレームサイズ指定が必要になる
  → `receipt.png` のサイズ（32 × 48 px）を `FrameSize.RECEIPT` として定数管理し、変更が1か所に集まるようにする
- `receipt_2.png` / `receipt_3.png` の削除は非可逆
  → 現在3種はすべて同一画像のため、元に戻す必要性はない。削除前に git 履歴に残るため復元可能
