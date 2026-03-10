import Phaser from "phaser";

interface FloatingEffect {
  text: Phaser.GameObjects.Text;
  followScroll: boolean;
}

/**
 * 衝突・イベント発生時に浮き上がりテキストエフェクトを生成・更新・破棄する。
 * followScroll=true のエフェクトは update() で x 座標をスクロール量だけ補正する。
 */
export class EffectManager {
  private activeEffects: FloatingEffect[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  spawnFloatingText({
    x,
    y,
    text,
    followScroll,
  }: {
    x: number;
    y: number;
    text: string;
    followScroll: boolean;
  }): void {
    const textObj = this.scene.add
      .text(x, y, text, {
        fontSize: "36px",
        color: "#ffee00",
        fontFamily: "sans-serif",
        stroke: "#cc6600",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setScale(0);

    const effect: FloatingEffect = { text: textObj, followScroll };
    this.activeEffects.push(effect);

    // ボヨヨ〜ン出現
    this.scene.tweens.add({
      targets: textObj,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: "Elastic.Out",
      easeParams: [1.5, 0.5],
      onComplete: () => {
        // 上昇しながらフェードアウト
        this.scene.tweens.add({
          targets: textObj,
          y: textObj.y - 80,
          alpha: 0,
          duration: 800,
          ease: "Linear",
          onComplete: () => {
            textObj.destroy();
            this.activeEffects = this.activeEffects.filter(
              (e) => e.text !== textObj,
            );
          },
        });
      },
    });
  }

  /** スクロール追従エフェクトの x 座標を補正する。毎フレーム呼ぶこと。 */
  update(scrollDelta: number): void {
    for (const effect of this.activeEffects) {
      if (effect.followScroll) {
        effect.text.x -= scrollDelta;
      }
    }
  }
}
