# Design: initial-game

## Context

新規Webゲームプロジェクト「確定申告ラン（Kakutei-Run）」を0から構築する。
フロントエンドのみで完結し、URLアクセスだけで遊べる横スクロールアクションゲームである。
既存コードベースは存在しない。

技術選定バックグラウンド:

- オーナーは過去にVue.js + matter.js でゲームを実装した経験がある
- 今回はゲーム機能が豊富なフレームワークで効率よく開発したい
- スマホ・PCの両対応が必要なため、タッチ/キーボード両対応が容易であること

## Goals / Non-Goals

**Goals:**

- Phaser 3 + TypeScript + Vite によるゲームアプリの土台を構築する
- ローカル開発環境で動作確認できる状態にする（優先度最高）
- グラフィックはプレースホルダー画像で実装し、後から差し替え可能な構成にする
- ロジック層（マップ生成・衝突判定・スコア計算）のユニットテストを組み込む
- Azure Static Web Apps へのデプロイ構成（GitHub Actions）を整える

**Non-Goals:**

- バックエンド・データベース・認証は一切持たない
- 多言語化対応（日本語のみ）
- ハイスコアランキングなどのオンライン機能
- 効果音・BGM（優先度低として後回し）

## Decisions

### D1: ゲームエンジンに Phaser 3 を採用する

**決定**: Phaser 3

**理由**:

- スプライトアニメーション・衝突判定・Arcadeフィジックス・Inputが全部入り
- シーン管理が Vue のルーティングに相当し、単体で画面遷移も管理できる
- matter.js（物理エンジン）は今回不要。Phaser の Arcade Physics で十分
- TypeScript 公式サポートあり
- 豊富な公式ドキュメントとサンプルが学習コストを低減する

**却下した選択肢**:

- Vue.js + Canvas: Vue の reactivity とゲームループの相性が悪く、構成が複雑になる
- PixiJS: 描画は優秀だがゲームロジックの骨格を自前で書く必要がある
- Phaser + Vue の組み合わせ: このゲームの規模では Phaser 単体で十分

---

### D2: ビルドツールに Vite を採用する

**決定**: Vite + `vite-plugin-phaser`（または標準設定）を使用

**理由**:

- 高速な HMR（ホットリロード）で開発体験が良い
- TypeScript・静的アセット（画像・音声）のハンドリングが標準で揃っている
- Azure SWA への静的ビルドとも相性が良い

---

### D3: テストに Vitest を採用する

**決定**: Vitest でロジック層のみ単体テストする

**対象テスト**:

- `MapGenerator` のランダム生成ロジック（配置ルール検証）
- 衝突判定ロジック（矩形の重なり計算）
- スコア計算（レシート回収率）
- 難易度パラメータの取得

**対象外**:

- Phaser のシーン・スプライト描画（フレームワーク内部のため）
- ユーザーインタラクション（E2Eは後回し）

**理由**: フロントエンドでのユニットテスト導入が初めてのオーナー向けに、
最も価値が高く・学習効果のある範囲に絞る

---

### D4: ゲームキャンバスサイズと画面フィット戦略

**決定**: 基本サイズ 960×540（16:9）、Phaser の `ScaleManager` で画面フィット

```text
mode: Phaser.Scale.FIT
autoCenter: Phaser.Scale.CENTER_BOTH
```

**理由**:

- スマホ縦持ち・PC横置きどちらでもゲームが画面内に収まる
- スクロール発生を防げる（スマホ要件）
- 16:9 は最も互換性が高いアスペクト比

---

### D5: スクロール方式

**決定**:

- 自キャラはX座標を画面中央固定
- 世界（地面・障害物・アイテム・税務署）がすべて左に流れる
- 視差スクロール: 遠景（bg_far）は速度×0.3、近景（bg_near）は速度×0.7、地面は速度×1.0

**理由**:

- Phaser の `tileSprite` を使えば背景のループが数行で実装できる
- 視差（パララックス）効果で奥行き感が生まれゲームの没入感が上がる

---

### D6: チャージジャンプの物理実装

**決定**: Phaser Arcade Physics の velocity を直接操作する

```text
チャージ量 = min(押下時間 / 500ms, 1.0)  // 0.0 〜 1.0
初速 = 400 + (900 - 400) × チャージ量  // 400 〜 900 px/s（上方向）
重力 = 1500 px/s²（固定）
```

- 上限に達したらチャージ量を 1.0 に固定（押し続けてOK）
- 離した瞬間に上記の初速を Y 方向にセット
- 着地判定: プレーヤーが地面コライダーに触れた時点でジャンプ解除

**理由**: matter.js のような本格物理は不要。シンプルな放物線でゲームとして成立する

---

### D7: アセット管理方針

**決定**:

- `src/assets/` にアセットキー定数を集約（`AssetKeys.ts`）
- スプライトシートは `public/assets/sprites/` に配置
- 音声は `public/assets/audio/` に配置
- ファイル名とアセットキーを `AssetKeys.ts` で一元管理することで後から差し替えが容易

**理由**: グラフィックはオーナーが用意するため、
コードを変更せずにファイルを差し替えるだけで済む構成にする

---

### D8: 難易度・ゲームパラメータ管理

**決定**:

- `src/config/difficultyConfig.ts` に難易度エントリの**配列**を定義する（固定の型ユニオンは使わない）
- `src/config/gameConfig.ts` に難易度によらない物理パラメータを定義する

**difficultyConfig.ts に含むもの（配列エントリごと）**:
`id`・`displayName`・`scrollSpeed`・`stageLength`・`receiptCount`・`stoneFrequency`・`witchFrequency`

**gameConfig.ts に含むもの**:
`gravity`・`minJumpVelocity`・`maxJumpVelocity`・`maxChargeTime`・`witchSpeedReduction`・`witchDistanceFraction`・`witchScrollSpeedFactorMin`・`witchScrollSpeedFactorMax`・`witchYMin`・`witchYMax`・`receiptSpeedFactorMin`・`receiptSpeedFactorMax`・`receiptYMin`・`receiptYMax`・`objectMinDistance`

`witchSlowDuration`（腰痛スロー継続時間）は設定値ではなく、以下の式で**自動計算**する:

```text
witchSlowDuration =
  initialEnemyDistance × witchDistanceFraction
  ─────────────────────────────────────────────
      scrollSpeed × witchSpeedReduction
```

**理由**:

- 難易度の追加・削除が配列編集だけで完結する（`type Difficulty` のユニオン型を毎回変更しなくてよい）
- `witchSpeedReduction`（焦りの強度）と `witchDistanceFraction`（何回で捕まるか）を独立して調整できる
- `witchSlowDuration` を自動計算にすることで「被弾1回あたりの距離縮小割合」というゲームルールが常に保証される

## Risks / Trade-offs

- **[リスク] Phaser の学習コスト** → 公式ドキュメントと Examples を参照しながら進める。躓いたら都度解説する
- **[リスク] スマホ Safari でのタッチ操作とスクロール干渉** → `touch-action: none` を canvas に設定し、`preventDefault()` で対処
- **[リスク] グラフィックなしのプレースホルダー実装** → 矩形カラーとテキストで代替し、後から画像に差し替え
- **[トレードオフ] Phaser 単体（Vue なし）** → Vue の知識が活かせないが、ゲーム開発では Phaser のシーン管理の方が適している
- **[リスク] SNSシェア時のスクリーンショット取得** → `html2canvas` or Canvas の `toDataURL()` を使う。優先度中なので後回し
