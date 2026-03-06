# Tasks: issue-3-title-result-ui-redesign

## Task 1. Tailwind CSS + DaisyUI のセットアップ

- [x] 1.1 `tailwindcss`, `@tailwindcss/vite`, `daisyui` を devDependencies にインストールする
- [x] 1.2 `vite.config.ts` に `@tailwindcss/vite` プラグインを追加し、`__APP_VERSION__` の define を追加する
- [x] 1.3 `src/style.css` を新規作成し `@import "tailwindcss"`・`@plugin "daisyui"`・`font-family: 'DotGothic16'` を記述する
- [x] 1.4 `index.html` の `<head>` に Google Fonts（DotGothic16）の `<link>` と `<link rel="stylesheet" href="/src/style.css">` を追加する
- [x] 1.5 ビルド・開発サーバーで Tailwind クラスが適用されることを確認する

## Task 2. タイトルロゴプレースホルダーの追加

- [x] 2.1 `public/assets/ui/` ディレクトリを作成し、`title_logo.png`（ベタ塗り矩形のプレースホルダー PNG）を追加する
- [x] 2.2 `index.html` の `#title-screen` 内に `<img id="title-logo" src="/assets/ui/title_logo.png" alt="確定申告ラン">` を配置する

## Task 3. index.html のスタイル刷新（Tailwind クラスへ移行）

- [x] 3.1 `index.html` のインライン `<style>` タグを削除する
- [x] 3.2 `body` / `#game-container` のレイアウトクラスを Tailwind で記述する
- [x] 3.3 `#hud-overlay` を Tailwind クラスで再実装する
- [x] 3.4 `#title-screen` を縦画面は縦並び・横画面は2カラム（`landscape:flex-row`）のレイアウトで再実装する（ロゴ左・ボタン群右）
- [x] 3.5 `#result-screen` を縦画面は縦並び・横画面は2カラムのレイアウトで再実装する
- [x] 3.6 `#result-screen` に難易度表示用の空要素（`<div id="result-difficulty"></div>`）をあらかじめ配置する（非表示）
- [x] 3.7 `#pause-btn` / `#pause-overlay` を Tailwind クラスで再実装する
- [x] 3.8 DaisyUI の `btn` クラスを使って難易度ボタン・シェアボタンをスタイリングする
- [x] 3.9 アプリバージョン表示用の `<span id="app-version"></span>` を `#title-screen` に追加する

## Task 4. DifficultyButtons 共通コンポーネントの作成

- [x] 4.1 `src/ui/DifficultyButtons.ts` を新規作成し、難易度ボタン群の DOM 生成・クリックコールバック呼び出しを実装する

## Task 5. TitleUI の修正

- [x] 5.1 スタートボタン（`#start-btn`）の参照と setupStartButton メソッドを削除する
- [x] 5.2 難易度ボタンを `DifficultyButtons` コンポーネントに置き換え、タップで即 `kakutei:startGame` を発火するよう変更する
- [x] 5.3 コンストラクタで `#app-version` 要素に `__APP_VERSION__` を設定する

## Task 6. ResultUI の修正

- [x] 6.1 難易度ボタン生成ロジックを `DifficultyButtons` コンポーネントに置き換える

## Task 7. 動作確認

- [x] 7.1 縦画面でタイトル画面・リザルト画面が正しく表示されることを確認する
- [x] 7.2 横画面でタイトル画面・リザルト画面が2カラムレイアウトで表示され、はみ出しがないことを確認する
- [x] 7.3 難易度ボタン1タップでゲームが開始されることを確認する
- [x] 7.4 リザルト画面から難易度ボタンでリトライできることを確認する
- [x] 7.5 バージョン番号がタイトル画面に表示されることを確認する
