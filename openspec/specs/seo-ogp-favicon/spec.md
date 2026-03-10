# spec: seo-ogp-favicon

## Requirements

### Requirement: ブラウザタイトルの表示

`index.html` の `<title>` タグは `確定RUN | 確定申告応援ゲーム` と表示されなければならない（SHALL）。

#### Scenario: ブラウザタブのタイトル確認

- **WHEN** ユーザーがサイトを開く
- **THEN** ブラウザのタブに `確定RUN | 確定申告応援ゲーム` と表示される

---

### Requirement: 検索エンジン向け description

`index.html` の `<head>` に `<meta name="description">` が含まれなければならない（SHALL）。

#### Scenario: description の内容確認

- **WHEN** 検索エンジンがページをクロールする
- **THEN** description として `カクコさんに追いつかれる前に確定申告を終わらせろ！レシートを集めて税務署へ走る確定申告応援ランゲーム。白ちゃんを応援しながら、自分も申告しよう。` が取得できる

---

### Requirement: OGP タグの設定

`index.html` の `<head>` に以下の OGP タグが含まれなければならない（SHALL）。

- `og:title`：`確定RUN | 確定申告応援ゲーム`
- `og:description`：description と同じ内容
- `og:image`：`public/ogp.png`（1200×630px）の絶対 URL
- `og:url`：本番サイトの URL
- `og:type`：`website`

#### Scenario: SNS でのプレビュー確認

- **WHEN** ユーザーがサイトの URL を X や Discord に貼り付ける
- **THEN** `確定RUN | 確定申告応援ゲーム` というタイトルと説明文・OGP 画像がプレビューとして表示される

---

### Requirement: Twitter Card タグの設定

`index.html` の `<head>` に以下の Twitter Card タグが含まれなければならない（SHALL）。

- `twitter:card`：`summary_large_image`
- `twitter:title`：`確定RUN | 確定申告応援ゲーム`
- `twitter:description`：description と同じ内容
- `twitter:image`：`og:image` と同じ URL

#### Scenario: X でのシェア確認

- **WHEN** ユーザーがサイトの URL を X に貼り付ける
- **THEN** 大きいサムネイル付きのカードとしてプレビューが表示される

---

### Requirement: ファビコンの表示

`index.html` の `<head>` に `<link rel="icon">` が含まれ、`public/favicon.png`（512×512px）を参照しなければならない（SHALL）。

#### Scenario: ブラウザタブのアイコン確認

- **WHEN** ユーザーがサイトを開く
- **THEN** ブラウザのタブにゲームのファビコン画像が表示される
