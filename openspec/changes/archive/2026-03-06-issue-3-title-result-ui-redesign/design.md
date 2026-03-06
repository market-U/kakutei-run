# Design: issue-3-title-result-ui-redesign

## Context

現在の HTML UI（`index.html`）はすべてのスタイルをインラインの `<style>` タグで管理しており、縦画面前提のレイアウトになっている。横画面では `#title-screen` / `#result-screen` の内容が画面高さを超えてはみ出すが、`overflow: hidden` のため視認・操作できない。

タイトル画面はスタートボタン・難易度ボタンの2段階操作が必要で、リザルト画面のリトライボタン（難易度選択＝即開始）と挙動が統一されていない。

## Goals / Non-Goals

**Goals:**

- Tailwind CSS v4 + DaisyUI v5 を導入し、インラインスタイルをユーティリティクラスで置き換える
- タイトル画面・リザルト画面に縦横レスポンシブレイアウトを実装する（横画面時：2カラム）
- スタートボタンを廃止し、難易度ボタン1タップで即開始する挙動に統一する
- タイトルロゴ配置用プレースホルダー画像を用意し、後の差し替えに対応する
- アプリバージョンを画面に表示する
- 難易度ボタンを共通コンポーネント（`DifficultyButtons`）として切り出す

**Non-Goals:**

- ゲームシーン（Phaser キャンバス）のレイアウト変更
- HUD・ポーズ画面のデザイン変更
- DaisyUI のテーマ切り替え機能の利用

## Decisions

### 1. Tailwind CSS v4 + `@tailwindcss/vite` プラグイン

Tailwind v4 は `tailwind.config.js` 不要で、Vite プラグインを追加するだけで動作する。

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({ plugins: [tailwindcss()] });
```

```css
/* src/style.css（新規） */
@import "tailwindcss";
@plugin "daisyui";
```

`index.html` で `<link rel="stylesheet" href="/src/style.css">` を読み込む。既存のインライン `<style>` は削除する。

**v3 ではなく v4 を選ぶ理由**: Vite との統合がシンプル・設定ファイル不要・パフォーマンス向上。

### 2. 横画面 2カラムレイアウトの実装方法

`@media (orientation: landscape)` を Tailwind の `landscape:` バリアントで表現する。

```html
<!-- 縦画面：flex-col / 横画面：flex-row（2カラム） -->
<div class="flex flex-col landscape:flex-row ...">
  <div class="landscape:flex-1"><!-- ロゴ・タイトル --></div>
  <div class="landscape:flex-1"><!-- ボタン群 --></div>
</div>
```

横画面時は高さが制限されるため、コンテナに `overflow-y-auto max-h-svh` を付けてスクロール可能にする。

### 3. タイトルロゴのプレースホルダー

`public/assets/ui/title_logo.png` にベタ塗り PNG のプレースホルダーを置く。`<img src="/assets/ui/title_logo.png" alt="確定申告ラン">` で参照する。本番アセットへの差し替えは同じパス・ファイル名で PNG を上書きするだけで完結する。

### 4. Webフォント

Google Fonts の **DotGothic16** をボタン・本文・UI テキスト全般に使用する。ドット調のビットマップフォントでゲームらしいレトロ感を演出する。タイトルロゴは画像で提供されるため、フォントの適用対象外。

```html
<!-- index.html <head> に追加 -->
<link href="https://fonts.googleapis.com/css2?family=Dot+Gothic+16&display=swap" rel="stylesheet">
```

```css
/* src/style.css */
body {
  font-family: 'DotGothic16', sans-serif;
}
```

DotGothic16 は 16px 設計のため、**フォントサイズは 16px・32px など 16 の倍数**を基準に指定する。

### 5. アプリバージョンの埋め込み

`vite.config.ts` の `define` で `package.json` のバージョンを注入する。

```ts
import pkg from "./package.json";
define: { __APP_VERSION__: JSON.stringify(pkg.version) }
```

HTML 側は `<span id="app-version"></span>` を配置し、`TitleUI` のコンストラクタで `document.getElementById("app-version").textContent = __APP_VERSION__` と設定する。

### 6. DifficultyButtons 共通コンポーネント

`src/ui/DifficultyButtons.ts` を新規作成し、難易度ボタンの DOM 生成と選択ハイライト管理を担う。`TitleUI` と `ResultUI` の両方から利用する。

```ts
// 使用例（TitleUI 側）
const diffButtons = new DifficultyButtons(container, (difficultyId) => {
  this.hide();
  window.dispatchEvent(new CustomEvent("kakutei:startGame", { detail: { difficultyId } }));
});
```

リザルト画面は既存どおり難易度選択＝即リトライのため、コールバックに `kakutei:retryGame` を渡すだけで再利用できる。

## Risks / Trade-offs

- **Tailwind v4 は比較的新しく、DaisyUI v5 との組み合わせの実績が少ない** → 導入前に `npm install` 後の動作を確認する。問題があれば Tailwind v3 + PostCSS 構成にフォールバックする。
- **`landscape:` バリアントがデスクトップ横長ウィンドウにも適用される** → ゲーム自体が横長（960×540）なのでデスクトップでは常に横画面レイアウトが表示されることになるが、これは望ましい動作。
- **インラインスタイルの全削除によるリグレッション** → HUD・ポーズ・リザルト画面のスタイルも同時に Tailwind クラスに移行するため、各画面の見た目を確認する。

## Migration Plan

1. `tailwindcss`, `@tailwindcss/vite`, `daisyui` をインストール
2. `vite.config.ts` にプラグイン追加・バージョン定義追加
3. `src/style.css` を作成し `index.html` で読み込む
4. `index.html` のインラインスタイルを Tailwind クラスへ移行（HUD・タイトル・リザルト・ポーズ）
5. `public/assets/ui/logo-placeholder.svg` を追加
6. `src/ui/DifficultyButtons.ts` を新規作成
7. `TitleUI.ts` をスタートボタン廃止・`DifficultyButtons` 利用に変更
8. `ResultUI.ts` を `DifficultyButtons` 利用に変更

## Open Questions

- リザルト画面に「遊んだ難易度」を表示する予定（別 Issue で対応）。リザルト画面のレイアウトは結果タイトル・スコア・難易度表示・シェアボタン・リトライボタンという構成を想定し、**難易度表示エリアの DOM 要素（`#result-difficulty`）をあらかじめ配置しておく**が、表示ロジックは実装しない。
