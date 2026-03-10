/**
 * 難易度エントリの定義
 * 配列で管理することで難易度の追加・削除が容易に行える
 */
export interface DifficultyEntry {
  id: string;
  displayName: string;
  /** ステージに配置されるレシートの総枚数 */
  receiptCount: number;
  /** 石ころの出現頻度（ステージ長1000pxあたりの個数基準） */
  stoneFrequency: number;
  /** 魔女の出現頻度（ステージ長1000pxあたりの個数基準） */
  witchFrequency: number;
  /** 地面スクロール速度 (px/s) */
  scrollSpeed: number;
  /** ステージの全長 (px) */
  stageLength: number;
}

export const difficulties: DifficultyEntry[] = [
  {
    id: "easy",
    displayName: "LV1 医療費控除",
    receiptCount: 10,
    stoneFrequency: 0.8,
    witchFrequency: 0.2,
    scrollSpeed: 360,
    stageLength: 6000,
  },
  {
    id: "normal",
    displayName: "LV2 白色申告",
    receiptCount: 15,
    stoneFrequency: 1.5,
    witchFrequency: 0.5,
    scrollSpeed: 360,
    stageLength: 8000,
  },
  {
    id: "hard",
    displayName: "LV3 青色申告",
    receiptCount: 25,
    stoneFrequency: 2.1,
    witchFrequency: 1,
    scrollSpeed: 360,
    stageLength: 11000,
  },
];

/**
 * ID で難易度エントリを取得する
 * @throws ID が存在しない場合に Error を投げる
 */
export function getDifficultyById(id: string): DifficultyEntry {
  const entry = difficulties.find((d) => d.id === id);
  if (!entry) {
    throw new Error(
      `Unknown difficulty id: "${id}". Available: ${difficulties.map((d) => d.id).join(", ")}`,
    );
  }
  return entry;
}
