# Design: issue-27-responsive-html-ui

## Context

現在のゲームは Phaser 3 のみで UI を含むすべてを実装している（960×1440 キャンバス）。ゲームゾーンはキャンバスの 37.5%（y=360〜900, 960×540）しか占めず、スマホ縦画面ではキャラクターが小さい。ゲームゾーンは 960×540 = 16:9 で横画面スマホとほぼ同比率。HUD・タイトル・リザルトが Phaser のテキストオブジェクトで実装されており CSS によるデザイン変更が困難な状態である。

## Goals / Non-Goals

**Goals:**

- スマホ横画面でゲームゾーン（16:9）を画面いっぱいに表示する
- 縦画面でも引き続きプレイ可能にする
- HUD・タイトル・リザルトを HTML/CSS に移行してデザインの柔軟性を高める
- 端末回転の自動検知とゲーム内手動ボタンの両方で縦横を切り替えられるようにする
- ゲーム中の回転時はポーズ状態にする
- ゲームロジック（座標系・物理・衝突判定等）を一切変更しない

**Non-Goals:**

- Safari でのフルスクリーン化（PWA 化は別 Issue）
- タイトル・リザルト画面のデザイン改善（Issue #3 のスコープ）
- React/Vue 等の UI フレームワーク導入

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

### Decision 2: 横画面でゲームゾーンのみを表示するために Phaser Camera のビューポートを使う

横画面時は `cameras.main.setViewport(0, 0, CANVAS_W, GAME_ZONE_HEIGHT)` + `cameras.main.scrollY = GAME_ZONE_Y` を適用し、ゲームゾーン部分だけをキャンバスに描画する。CSS でキャンバス要素を横画面いっぱいに拡大する。

```
【縦画面】                          【横画面】
Phaser キャンバス (960×1440)        Phaser キャンバス (960×1440)
┌───────────┐                      ┌───────────┐
│ UI上部(空) │ y=0                  │ UI上部(空) │ y=0    ← カメラに映らない
│───────────│ y=360                │───────────│ y=360
│ ゲームゾーン│                      │ ゲームゾーン│  ← viewport: y=0, h=540
│           │                      │           │     scrollY=360
│───────────│ y=900                │───────────│ y=900  ← カメラに映らない
│ UI下部(空) │                      │ UI下部(空) │
└───────────┘ y=1440               └───────────┘ y=1440

CSS: canvas を FIT スケール          CSS: canvas を横画面にフィット
     (縦長全体が画面に収まる)               (560×540相当が画面いっぱい)
```

**採用理由:** ゲームオブジェクトの座標（GAME_ZONE_Y オフセット等）を変更せずに済む。全シーンで同じキャンバスサイズ・同じ座標系を維持できる。

**不採用案:** Phaser Game の `width/height` を動的変更 → Phaser の再初期化が必要で全シーンが影響を受ける。

### Decision 3: TitleScene・ResultScene を Phaser シーンから廃止してピュア HTML に移行する

`src/ui/TitleUI.ts` と `src/ui/ResultUI.ts` として TypeScript クラスで実装し、DOM を直接操作する。Phaser の `scene` リストから削除する。

**BootScene の役割変更:** アセット読み込み完了後 `this.scene.start("TitleScene")` の代わりに `window.dispatchEvent(new CustomEvent('kakutei:assetsLoaded'))` を発火し、HTML 側がタイトル画面を表示する。BootScene 自体は Phaser シーンとして残す（アセット読み込みは Phaser の責務のままにする）。

**採用理由:** タイトル・リザルトは横画面対応を含むレイアウト調整が必要であり、CSS で縦横両レイアウトを管理する方が自然。将来の Issue #3（デザイン改善）も CSS ベースで実施できる。

**不採用案:** Phaser シーンのまま横画面を別レイアウトで対応 → カメラビューポート切り替え時に Phaser テキストの座標を動的に計算し直す必要があり複雑度が増す。

### Decision 4: OrientationManager を独立した TS クラスとして実装する

`src/systems/OrientationManager.ts` に向き管理ロジックを集約する。以下の責務を持つ：

1. `screen.orientation.addEventListener('change')` で端末回転を検知（古い Safari の場合は `window.addEventListener('orientationchange')` でフォールバック）
2. 手動切り替えボタン（HTML DOM）を管理する
3. 現在の向きに応じて CSS クラスを `body` に付与（`portrait` / `landscape`）し、Phaser カメラを切り替える
4. ゲーム中（GameScene がアクティブ）に向きが変わった場合、`kakutei:orientationChanged` イベントを発火してポーズを促す

**CSS クラスによるレイアウト切り替え:**

```css
/* 縦画面: Phaser キャンバス全体を縦長で表示 */
body.portrait #game-container canvas { ... }

/* 横画面: ゲームゾーン部分のみを拡大表示 */
body.landscape #game-container canvas { ... }
```

### Decision 5: HUD は HTML overlay div を DOM 操作で更新する

`src/ui/HUD.ts` の `receiptText` / `distanceText` を Phaser テキストオブジェクトから `document.getElementById()` への参照に変更する。GameScene からの `hud.setCollectedCount()` / `hud.setDistance()` の呼び出しインターフェースは変えない。

## Risks / Trade-offs

- **[リスク] screen.orientation が古い iOS Safari で未サポート** → `window.orientation`（非推奨だが広くサポート）でフォールバックを実装する
- **[リスク] BootScene（Phaser シーン）のプログレスバーが縦長キャンバス全体に描画される** → BootScene は横画面対応スコープ外とし、縦画面固定で表示する。BootScene 実行中は OrientationManager を未起動にする
- **[トレードオフ] HTML と Phaser の二重管理** → イベント経由の疎結合により責務を分離しているため、一方の変更が他方に波及するリスクは低い
- **[リスク] カメラビューポート切り替え時のフレームずれ** → 切り替えは `update` ループ外（イベントハンドラ）で行い、切り替え直後に `cameras.main.resetFX()` を呼ぶ

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
