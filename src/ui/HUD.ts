import Phaser from "phaser";

/** ゲームプレイ中のHUD表示（UI上部ゾーンに配置） */
export class HUD {
  private receiptText: Phaser.GameObjects.Text;
  private distanceText: Phaser.GameObjects.Text;

  private collectedCount = 0;
  private totalCount = 0;
  private distance = 0;

  constructor(scene: Phaser.Scene, totalReceipts: number) {
    this.totalCount = totalReceipts;

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: "32px",
      color: "#ffffff",
      fontFamily: "sans-serif",
      stroke: "#000000",
      strokeThickness: 4,
    };

    // レシート収集数 — UI上部ゾーン内に配置
    this.receiptText = scene.add
      .text(40, 240, "", style)
      .setScrollFactor(0)
      .setDepth(20);

    // 進行距離
    this.distanceText = scene.add
      .text(40, 290, "", style)
      .setScrollFactor(0)
      .setDepth(20);

    this.refresh();
  }

  setCollectedCount(n: number): void {
    this.collectedCount = n;
    this.refresh();
  }

  setDistance(px: number): void {
    this.distance = px;
    this.refresh();
  }

  private refresh(): void {
    this.receiptText.setText(
      `レシート: ${this.collectedCount} / ${this.totalCount}`,
    );
    this.distanceText.setText(`距離: ${Math.floor(this.distance)}m`);
  }
}
