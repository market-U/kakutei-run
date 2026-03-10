## Why

衝突イベントが発生しても視覚的なフィードバックがなく、プレーヤーは得点やゲームイベントを直感的に認識しにくい。レシート取得・ゴール到達・Enemy 到達の各イベントに浮き上がりテキストエフェクトを追加し、ゲームの手触りと情報伝達を向上させる。

## What Changes

- `EffectManager` を新設し、浮き上がりテキストエフェクトの生成・更新・破棄を一元管理する
- レシート取得時に "+1" テキストが衝突地点から上昇しながらフェードアウトするエフェクトを追加する（スクロールに追従）
- ゴール到達時の既存テキスト演出をボヨヨ〜ン（Elastic.Out）アニメーションで強化する
- Enemy 到達時に複数のテキストからランダムに選択したメッセージを画面上に表示するエフェクトを追加する

## Capabilities

### New Capabilities

- `collision-effects`: 衝突・イベント発生時に浮き上がりテキストエフェクトを表示する機能

### Modified Capabilities

（なし）

## Impact

- `src/systems/` に `EffectManager.ts` を新規追加
- `src/scenes/GameScene.ts`: EffectManager の初期化・update ループへの組み込み・各イベントハンドラからの呼び出しを追加
- `src/scenes/GameScene.ts`: ゴール演出の既存テキスト処理に Elastic アニメーションを追加
- 新規アセット追加なし（Phaser Text オブジェクトを使用。後でアセットへの差し替えも可能な設計）
