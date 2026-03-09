# Spec Delta: result-share-image

## MODIFIED Requirements

### Requirement: Canvas API によるシェア用画像生成

リザルト画面のシェアボタン押下時に Canvas API で 1080×1080px の画像を生成しなければならない（SHALL）。

#### Scenario: クリア時の画像生成

- **WHEN** クリア結果でシェアボタンが押される
- **THEN** `public/assets/ui/share_clear.png` をベースに Canvas へ描画する
- **AND** 難易度名を上部に重ねて描画する
- **AND** レシート取得率・走行距離・シェア用コメント・バージョンを下部に重ねて描画する

#### Scenario: ゲームオーバー時の画像生成

- **WHEN** ゲームオーバー結果でシェアボタンが押される
- **THEN** `public/assets/ui/share_gameover.png` をベースに Canvas へ描画する
- **AND** 難易度名を上部に重ねて描画する
- **AND** レシート取得率・走行距離・シェア用コメント・バージョンを下部に重ねて描画する

#### Scenario: シェア用コメントが存在しない場合

- **WHEN** シェアボタンが押された時点でシェア用コメント候補が `null` である
- **THEN** コメント欄を空白として画像を生成する
