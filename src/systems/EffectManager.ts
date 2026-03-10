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

  // 表示後上に浮き上がりながらフェードアウトするテキストエフェクトをスポーンする
  spawnFloatingText({
    x,
    y,
    text,
    sizePx,
    color,
    followScroll,
  }: {
    x: number;
    y: number;
    text: string;
    sizePx: number;
    color: string;
    followScroll: boolean;
  }): void {
    const textObj = this.scene.add
      .text(x, y, text, {
        fontSize: `${sizePx}px`,
        color: color,
        fontFamily: "LineSeed Sans Mono",
        fontStyle: "bold",
        stroke: "#ffffff",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setScale(0);

    const effect: FloatingEffect = { text: textObj, followScroll };
    this.activeEffects.push(effect);

    this.scene.tweens.chain({
      tweens: [
        {
          targets: textObj,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
        },
        {
          targets: textObj,
          y: textObj.y - 80,
          alpha: 0,
          duration: 800,
          ease: "Linear",
        }
      ],
      onComplete: () => {
        textObj.destroy();
        this.activeEffects = this.activeEffects.filter(
          (e) => e.text !== textObj,
        );
      },
    });
  }

  // 表示後上に浮き上がりながらフェードアウトするテキストエフェクトをスポーンする
  spawnText({
    x,
    y,
    text,
    sizePx,
    color,
    followScroll,
  }: {
    x: number;
    y: number;
    text: string;
    sizePx: number;
    color: string;
    followScroll: boolean;
  }): void {
    const textObj = this.scene.add
      .text(x, y, text, {
        fontSize: `${sizePx}px`,
        color: color,
        fontFamily: "sans-serif",
        stroke: "#ffffff",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setScale(0);

    const effect: FloatingEffect = { text: textObj, followScroll };
    this.activeEffects.push(effect);

    // ボヨヨ〜ン出現
    textObj.setAngle(10);
    this.scene.tweens.chain({
      tweens: [
        {
          targets: textObj,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 200,
        },
        {
          targets: textObj,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 500,
          ease: "Sine.InOut",
          yoyo: true,
          loop: -1,
        }
      ],
      onComplete: () => {
        textObj.destroy();
        this.activeEffects = this.activeEffects.filter(
          (e) => e.text !== textObj,
        );
      },
    });
  }

  /** シーン SHUTDOWN 時にアクティブなエフェクトをすべて破棄する。 */
  destroy(): void {
    for (const effect of this.activeEffects) {
      effect.text.destroy();
    }
    this.activeEffects = [];
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
