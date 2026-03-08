# Tasks: リザルトシェア内容の改善

## 1. CommentManager に感動スコア機能を追加

- [ ] 1.1 `CommentManager` にシェア用コメント候補オブジェクト `{ comment: string, score: number } | null` フィールドを追加する
- [ ] 1.2 `startGame()` で候補を `null` にリセットする処理を追加する
- [ ] 1.3 `spawnComment()` で感動スコア（0〜100 のランダム整数）を生成し、保存済みスコアより高ければ候補を置き換える処理を追加する
- [ ] 1.4 `getShareComment(): string | null` ゲッターを追加する

## 2. シェア用ベース画像の配置

- [ ] 2.1 クリア用ベース画像 `share_clear.png`（1080×1080px）を `public/assets/ui/` に配置する
- [ ] 2.2 ゲームオーバー用ベース画像 `share_gameover.png`（1080×1080px）を `public/assets/ui/` に配置する

## 3. Canvas API によるシェア用画像生成

- [ ] 3.1 `ResultUI.ts` に `shareImagePromise: Promise<File | null> | null` フィールドを追加する
- [ ] 3.2 `generateShareImage()` メソッドを追加し、結果に応じたベース画像をロードして Canvas に描画する
- [ ] 3.3 難易度名を画像上部にオーバーレイするテキスト描画を実装する
- [ ] 3.4 レシート取得率・シェア用コメント・バージョンを画像下部にオーバーレイするテキスト描画を実装する
- [ ] 3.5 `canvas.toBlob()` で画像を `File` オブジェクトに変換する処理を実装する
- [ ] 3.6 `show()` 内でリザルト画面表示と同時に `generateShareImage()` を呼び出し、`shareImagePromise` に保持する

## 4. doShare() の改修

- [ ] 4.1 `doShare()` の先頭にシェア内容の編集箇所であることを示すコメントを追加する
- [ ] 4.2 `doShare()` 冒頭で `await this.shareImagePromise` し、画像生成完了を待ってからシェアする（生成中に押された場合も自然に待機、ハングなし）
- [ ] 4.3 シェアテキストのフレーズをクリア / ゲームオーバーで切り替える形式（`<難易度名> 確定成功！` / `<難易度名> 確定ならず…`）に変更する
- [ ] 4.4 スコアのラベルを `レシート取得率: xx%` に変更する
- [ ] 4.5 アプリバージョン（`__APP_VERSION__`）と URL（`window.location.href`）をシェアテキストに追加する
- [ ] 4.6 ハッシュタグを `#確定RUN` に変更する
- [ ] 4.7 `navigator.canShare({ files: [...] })` で判定し、対応環境では画像付き `navigator.share()` を、非対応環境ではテキストのみの Twitter URL を開くフォールバックを実装する

## 5. 動作確認

- [ ] 5.1 モバイル（iOS Safari）でシェアボタンを押し、画像付きシェアシートが表示されることを確認する
- [ ] 5.2 PC ブラウザでシェアボタンを押し、Twitter URL がテキストのみで開くことを確認する
- [ ] 5.3 クリア・ゲームオーバーそれぞれでフレーズ・ベース画像が正しく切り替わることを確認する
- [ ] 5.4 感動スコアで選出されたコメントが画像に表示されることを確認する
