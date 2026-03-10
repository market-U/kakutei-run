# tasks: SEO / OGP / ファビコン対策

## 1. 画像ファイルの配置

- [x] 1.1 OGP 用画像（1200×630px PNG）を `public/ogp.png` として配置する
- [x] 1.2 ファビコン用画像（512×512px PNG）を `public/favicon.png` として配置する

## 2. index.html の更新

- [x] 2.1 `<title>` を `確定RUN | 確定申告応援ゲーム` に変更する
- [x] 2.2 `<meta name="description">` を追加する
- [x] 2.3 OGP タグ（`og:title` / `og:description` / `og:image` / `og:url` / `og:type`）を追加する
- [x] 2.4 Twitter Card タグ（`twitter:card` / `twitter:title` / `twitter:description` / `twitter:image`）を追加する
- [x] 2.5 `<link rel="icon">` を追加して `public/favicon.png` を参照させる

## 3. 動作確認

- [ ] 3.1 ブラウザのタブにタイトルとファビコンが正しく表示されることを確認する
- [ ] 3.2 [OGP 確認ツール（OGP.biz 等）](https://ogp.biz/) でメタタグが正しく読み取られることを確認する
