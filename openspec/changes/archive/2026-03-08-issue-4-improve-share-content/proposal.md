# Proposal: リザルトシェア内容の改善

## Why

現在のシェアテキストは最低限の情報しか含まれておらず、ゲームの結果を魅力的に伝えられていない。ハッシュタグの統一、アプリバージョン・URL の追記、画像添付によるビジュアル訴求を加え、SNS でのシェアをより効果的にする。

## What Changes

- シェアテキストのフレーズを結果（クリア / ゲームオーバー）と難易度を組み合わせた形式に変更する
  - クリア時: `<難易度名> 確定成功！`
  - ゲームオーバー時: `<難易度名> 確定ならず…`
- スコアのラベルを `レシート取得率: xx%` に変更する
- ハッシュタグを `#確定RUN` に変更する
- アプリバージョン（`__APP_VERSION__`）と URL（`window.location.href`）をテキストに追加する
- Canvas API で 1080×1080px のシェア用画像を生成する
  - クリア用・ゲームオーバー用の 2 種類のベース画像（`public/assets/ui/` に配置）に難易度・スコア・ランダムコメント・バージョンをオーバーレイする
  - 難易度は上寄せ、スコア・コメント・バージョンは下寄せで配置する
  - Web Share API（`files` オプション）で画像ごと共有する。非対応環境ではテキストのみの Twitter URL にフォールバックする
- `doShare()` にシェア内容の編集箇所であることを示すコメントを追加する

## Capabilities

### New Capabilities

- `result-share-image`: Canvas API によるシェア用画像の生成と Web Share API を使った画像付き共有

### Modified Capabilities

- `html-ui`: SNS シェアの要件を拡張（シェアテキスト内容・画像添付・フォールバック挙動の変更）

## Impact

- `src/ui/ResultUI.ts`: `doShare()` メソッドの改修
- `public/assets/ui/`: シェア用ベース画像 2 枚の追加（`share_clear.png` / `share_gameover.png`）
- `window.__commentsData`: コメントプールからランダム選択するため参照する（既存グローバル変数）
- 新規ライブラリの追加なし（Canvas API・Web Share API はブラウザ標準）
