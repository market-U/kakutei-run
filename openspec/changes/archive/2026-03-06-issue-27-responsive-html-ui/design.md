# Design: issue-27-responsive-html-ui

## Context

現在のゲームは Phaser 3 のみで UI を含むすべてを実装している（960×1440 キャンバス）。ゲームゾーンはキャンバスの 37.5%（y=360〜900, 960×540）しか占めず、スマホ縦画面ではキャラクターが小さい。ゲームゾーンは 960×540 = 16:9 で横画面スマホとほぼ同比率。HUD・タイトル・リザルトが Phaser のテキストオブジェクトで実装されており CSS によるデザイン変更が困難な状態である。

## Goals / Non-Goals

**Goals:**

- あらゆるデバイス・向きで 16:9 ゲームゾーンを適切に表示する（Scale.FIT による自動スケーリング）
- 縦画面でも引き続きプレイ可能にする
- HUD・タイトル・リザルトを HTML/CSS に移行してデザインの柔軟性を高める
- 端末回転の自動検知によりゲーム中の回転時はポーズ状態にする
- スマホ縦画面でのタッチ入力を全画面で受け付ける
- ゲームロジック（座標系・物理・衝突判定等）を一切変更しない

**Non-Goals:**

- Safari でのフルスクリーン化（PWA 化は別 Issue）
- タイトル・リザルト画面のデザイン改善（Issue #3 のスコープ）
- React/Vue 等の UI フレームワーク導入
- スマホ横画面対応（ゲーム比率 16:9 固定のため対応を断念）

## Decisions

### Decision 1: HTML/Phaser の通信方式に `window.dispatchEvent` を使う

HTML UI 層と Phaser ゲームを Custom Event で疎結合に繋ぐ。

```
HTML Title UI                       Phaser
    │  startGame イベント発火  →       GameScene.start()
    │                          ←  gameResult イベント受信
HTML Result UI                      GameScene
```

**イベント一覧:**

| イベント名 | 発火元 | 受信先 | ペイロード |
|---|---|---|---|
| `kakutei:assetsLoaded` | BootScene | HTML UI | なし |
| `kakutei:startGame` | HTML Title UI | main.ts | `{ difficultyId }` |
| `kakutei:gameResult` | GameScene | HTML Result UI | `{ result, collected, total, difficultyId }` |
| `kakutei:retryGame` | HTML Result UI | main.ts | `{ difficultyId }` |
| `kakutei:orientationChanged` | OrientationManager | GameScene | `{ orientation: 'portrait' \| 'landscape' }` |

**採用理由:** Phaser 側から HTML 側に直接参照を持つ双方向依存を避けられる。イベント名に `kakutei:` プレフィックスを付けてグローバル汚染を最小化する。

**不採用案:** Phaser の `EventEmitter` を export して HTML から import → Phaser への依存が HTML 層に生まれる。

### Decision 2: Phaser キャンバスをゲームゾーン（960×540）専用にし、Scale.FIT に任せる

Phaser キャンバスは常に 960×540 の固定サイズとする。HUD・タイトル・リザルトはすべて HTML/CSS レイヤーが担うため、Phaser はゲームゾーンのみを描画すればよい。
`body { height: 100svh }` と `#game-container { width: 100%; height: 100% }` により、Scale.FIT がデバイスの実表示エリアに合わせて自動スケーリングする。

```text
【縦持ちスマホ】                     【横向きPC/デバイス】
body (100vw × 100svh)               body (100vw × 100svh)
┌──────────────┐                   ┌──────────────────────────┐
│              │ ← 黒帯            │                          │
│  ┌────────┐  │                   │  ┌────────────────────┐  │
│  │ canvas  │  │                   │  │      canvas        │  │
│  │ 960×540 │  │                   │  │      960×540       │  │
│  │ (縮小)  │  │                   │  │      (拡大)        │  │
│  └────────┘  │                   │  └────────────────────┘  │
│              │ ← 黒帯            │                          │
└──────────────┘                   └──────────────────────────┘
```

**採用理由:** 動的リサイズや Camera ビューポート切り替えを一切不要にできる。Phaser の再初期化が不要。座標系が常に 960×540 で統一される。`100svh` により Safari のアドレスバー等を除いた実表示エリアに正確にフィットする。

**不採用案（当初案）:** 960×1440 のキャンバスを使い Camera ビューポート切り替えで横画面対応 → 動的リサイズが Phaser 内部状態（カメラ・レンダラー・物理）に干渉し不安定だったため断念。

### Decision 3: TitleScene・ResultScene を Phaser シーンから廃止してピュア HTML に移行する

`src/ui/TitleUI.ts` と `src/ui/ResultUI.ts` として TypeScript クラスで実装し、DOM を直接操作する。Phaser の `scene` リストから削除する。

**BootScene の役割変更:** アセット読み込み完了後 `this.scene.start("TitleScene")` の代わりに `window.dispatchEvent(new CustomEvent('kakutei:assetsLoaded'))` を発火し、HTML 側がタイトル画面を表示する。BootScene 自体は Phaser シーンとして残す（アセット読み込みは Phaser の責務のままにする）。

**採用理由:** タイトル・リザルトは横画面対応を含むレイアウト調整が必要であり、CSS で縦横両レイアウトを管理する方が自然。将来の Issue #3（デザイン改善）も CSS ベースで実施できる。

**不採用案:** Phaser シーンのまま横画面を別レイアウトで対応 → カメラビューポート切り替え時に Phaser テキストの座標を動的に計算し直す必要があり複雑度が増す。

### Decision 4: OrientationManager は回転検知とポーズ通知のみに限定する

`src/systems/OrientationManager.ts` に向き管理ロジックを集約する。以下の責務を持つ：

1. `screen.orientation.addEventListener('change')` で端末回転を検知（古い Safari の場合は `window.addEventListener('orientationchange')` でフォールバック）
2. 現在の向きに応じて CSS クラスを `body` に付与（`portrait` / `landscape`）
3. ゲーム中（GameScene がアクティブ）に向きが変わった場合、`kakutei:orientationChanged` イベントを発火してポーズを促す

手動切り替えボタン（`#orientation-toggle`）は当初計画したが、Scale.FIT で十分なスケーリングが実現できたため削除した。Phaser カメラのビューポート切り替えも不要となったため実装しない。`OrientationManager` に Phaser の `game` インスタンスを渡す必要もない。

### Decision 5: HUD は HTML overlay div を DOM 操作で更新する

`src/ui/HUD.ts` の `receiptText` / `distanceText` を Phaser テキストオブジェクトから `document.getElementById()` への参照に変更する。GameScene からの `hud.setCollectedCount()` / `hud.setDistance()` の呼び出しインターフェースは変えない。

## Risks / Trade-offs

- **[リスク] screen.orientation が古い iOS Safari で未サポート** → `window.orientation`（非推奨だが広くサポート）でフォールバックを実装する
- **[トレードオフ] HTML と Phaser の二重管理** → イベント経由の疎結合により責務を分離しているため、一方の変更が他方に波及するリスクは低い
- **[断念] カメラビューポート動的切り替え** → 960×1440 + Camera viewport 方式は Phaser 内部状態（カメラ・レンダラー・物理）への干渉により不安定だったため、960×540 固定 + Scale.FIT 方式に変更した
- **[断念] スマホ横画面対応** → ゲーム比率 16:9 固定のまま横画面を強制することは難しく、実用的なメリットが少ないため対応を断念した

## Migration Plan

1. `index.html` に HUD overlay・タイトル・リザルトの HTML 構造と CSS を追加する
2. `HUD.ts` を DOM 操作に切り替える（GameScene からのインターフェースは維持）
3. `TitleUI.ts`・`ResultUI.ts` を新規作成し、HTML でタイトル・リザルトを実装する
4. `BootScene.ts` の遷移を `scene.start("TitleScene")` から Custom Event 発火に変更する
5. `main.ts` から TitleScene・ResultScene を削除し、OrientationManager を初期化する
6. `OrientationManager.ts` を新規作成してカメラビューポート切り替えと向き検知を実装する
7. `GameScene.ts` にポーズ処理と向き変化イベントのリスナーを追加する
8. `TitleScene.ts`・`ResultScene.ts` を削除する
9. README を更新する

ロールバック: TitleScene・ResultScene は削除前に git で追跡されているため、`git revert` で即座に戻せる。

## Open Questions

- なし（設計会話で合意済み）
