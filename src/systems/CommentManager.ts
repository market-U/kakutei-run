import Phaser from "phaser";
import { CANVAS_W } from "../config/canvasConfig";

/** コメント JSON のカテゴリ構造 */
export interface CommentsData {
  common: string[];
  difficulty: Record<string, string[]>;
  events: {
    start: string[];
    stumble: string[];
    goal: string[];
    backPain: string[];
  };
}

declare global {
  interface Window {
    __commentsData?: CommentsData | null;
  }
}

/** イベント種別 */
export type CommentEventType = "start" | "stumble" | "goal" | "backPain";

/** フォールバック用最小コメント */
const FALLBACK_COMMENTS: CommentsData = {
  common: ["がんばれ！", "走れ走れ！", "3月15日までに！"],
  difficulty: { easy: [], normal: [], hard: [] },
  events: {
    start: ["スタート！", "いくぞ！"],
    stumble: ["あ！", "転んだ！"],
    goal: ["確定〜〜！！", "8888888888"],
    backPain: ["腰の死…！", "大丈夫か！？"],
  },
};

/** fetch タイムアウト（ms） */
const FETCH_TIMEOUT_MS = 5000;
/** fetch リトライ最大回数 */
const FETCH_MAX_RETRIES = 3;

/**
 * AbortController を使ったタイムアウト付き fetch。
 * タイムアウトまたはネットワークエラー時は例外を投げる。
 */
async function fetchWithTimeout(url: string): Promise<CommentsData> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as CommentsData;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * コメントデータを外部 URL から取得し `window.__commentsData` へキャッシュする。
 * タイトル画面表示時に呼び出すこと。
 *
 * フォールバック順序:
 *   1. VITE_COMMENTS_URL (Azure Blob) をリトライ付きで fetch
 *   2. バンドル済み /comments.json を fetch
 *   3. ハードコード FALLBACK_COMMENTS 定数
 */
export async function loadCommentsData(): Promise<void> {
  const blobUrl = import.meta.env.VITE_COMMENTS_URL;

  if (blobUrl) {
    for (let i = 0; i < FETCH_MAX_RETRIES; i++) {
      try {
        window.__commentsData = await fetchWithTimeout(blobUrl);
        return;
      } catch (e) {
        console.warn(
          `[CommentManager] Blob fetch 失敗 (${i + 1}/${FETCH_MAX_RETRIES}):`,
          e,
        );
      }
    }
  }

  try {
    const res = await fetch("/comments.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    window.__commentsData = (await res.json()) as CommentsData;
    console.warn("[CommentManager] バンドル済み comments.json を使用します");
  } catch (e) {
    console.warn(
      "[CommentManager] フォールバックも失敗。ハードコード定数を使用します:",
      e,
    );
    window.__commentsData = FALLBACK_COMMENTS;
  }
}

/** 全コメントが画面を横断するのにかかる時間（ms） */
const CROSSING_DURATION = 3500;

/** レーンの Y 座標一覧（画面全体、60px 間隔） */
const LANE_Y_POSITIONS = [25, 80, 135, 190, 245, 300, 355, 410, 475];

/** 次のコメントを投入できる「前コメント進捗率」しきい値 */
const LANE_FREE_THRESHOLD = 0.3;

/** 通常スポーン間隔（ms） */
const SPAWN_INTERVAL_MIN = 2000;
const SPAWN_INTERVAL_MAX = 3500;

/** バーストコメント間の投入間隔（ms） */
const BURST_INTERVAL_MIN = 200;
const BURST_INTERVAL_MAX = 600;

/** コメントの深度 */
const COMMENT_DEPTH = 20;

/** コメントの透明度 */
const COMMENT_ALPHA = 0.82;

/** コメントのフォントサイズ */
const FONT_SIZE = "46px";

/** レーン管理データ */
interface Lane {
  /** 前のコメントが画面右端から何 px 進んだか（0〜totalDistance） */
  progressPx: number;
  /** 前のコメントの総移動距離（px） */
  totalDistancePx: number;
}

/** アクティブなコメントオブジェクト */
interface ActiveComment {
  text: Phaser.GameObjects.Text;
  /** px/ms */
  speed: number;
}

/**
 * ニコ生風コメントを管理するクラス。
 * ゲームプレイ中に画面右から左へコメントを流す。
 */
export class CommentManager {
  private scene: Phaser.Scene;
  private data: CommentsData = FALLBACK_COMMENTS;

  /** アクティブプール（common + difficulty）*/
  private activePool: string[] = [];

  /** レーン状態 */
  private lanes: Lane[];

  /** 画面上のアクティブコメント */
  private activeComments: ActiveComment[] = [];

  /** 表示 ON/OFF */
  private enabled = true;

  /** 次のスポーンまでの残り時間（ms） */
  private spawnTimer = 0;

  /** バースト投入キュー */
  private burstQueue: string[] = [];
  /** バースト残タイマー（ms）*/
  private burstTimer = 0;

  /** ループバーストのイベント種別（null = ループなし）*/
  private burstLoopType: CommentEventType | null = null;
  /** ループバーストの1バッチあたりの投入数 */
  private burstLoopCount = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.data = window.__commentsData ?? FALLBACK_COMMENTS;
    this.lanes = LANE_Y_POSITIONS.map(() => ({
      progressPx: Infinity,
      totalDistancePx: 1,
    }));
    this.resetSpawnTimer();
  }

  /**
   * ゲーム開始時にアクティブプールを合成する。
   * @param difficultyId 難易度 ID（"easy" | "normal" | "hard"）
   */
  startGame(difficultyId: string): void {
    const diffComments = this.data.difficulty[difficultyId] ?? [];
    this.activePool = [...this.data.common, ...diffComments];
    // 最初のコメントをすぐ出す
    this.spawnTimer = 300;
    // スタート応援バーストを投入
    this.triggerEvent("start", 4);
  }

  /**
   * イベント発生時にコメントをバースト投入する。
   * @param type イベント種別
   * @param count 投入数
   */
  triggerEvent(type: CommentEventType, count: number): void {
    if (!this.enabled) return;
    this.burstLoopType = null;
    this.burstQueue = [];
    const eventPool = this.data.events[type] ?? [];
    if (eventPool.length === 0) return;

    for (let i = 0; i < count; i++) {
      const text = eventPool[Math.floor(Math.random() * eventPool.length)];
      this.burstQueue.push(text);
    }
  }

  /**
   * イベントコメントをループバーストで流し続ける。
   * ゲームオーバー・クリア後にリザルト画面が表示されている間も継続させるために使用する。
   * @param type イベント種別
   * @param count 1バッチあたりの投入数
   */
  startLoopBurst(type: CommentEventType, count: number): void {
    if (!this.enabled) return;
    this.burstLoopType = type;
    this.burstLoopCount = count;
    this.burstQueue = [];
    const eventPool = this.data.events[type] ?? [];
    if (eventPool.length === 0) return;
    for (let i = 0; i < count; i++) {
      this.burstQueue.push(eventPool[Math.floor(Math.random() * eventPool.length)]);
    }
  }

  /**
   * 毎フレーム更新。
   * @param delta フレーム経過時間（ms）
   */
  update(delta: number): void {
    if (!this.enabled) return;

    // アクティブコメントを移動
    for (let i = this.activeComments.length - 1; i >= 0; i--) {
      const c = this.activeComments[i];
      c.text.x -= c.speed * delta;
      if (c.text.x < -c.text.width) {
        c.text.destroy();
        this.activeComments.splice(i, 1);
      }
    }

    // レーン進捗を更新
    for (const lane of this.lanes) {
      if (lane.progressPx < lane.totalDistancePx) {
        // 各レーンの最後のコメントが消えていれば Infinity にする
        // （シンプルに時間ベースで進捗を追跡する）
        lane.progressPx = Math.min(lane.progressPx + (CANVAS_W / CROSSING_DURATION) * delta, lane.totalDistancePx);
      }
    }

    // バーストキュー処理（ランダム間隔で投入）
    if (this.burstQueue.length > 0) {
      this.burstTimer -= delta;
      if (this.burstTimer <= 0) {
        const text = this.burstQueue.shift()!;
        this.spawnComment(text);
        this.burstTimer =
          BURST_INTERVAL_MIN +
          Math.random() * (BURST_INTERVAL_MAX - BURST_INTERVAL_MIN);
      }
    }

    // ループバースト: キューが空になったら同じイベントで再投入
    if (this.burstLoopType !== null && this.burstQueue.length === 0) {
      const eventPool = this.data.events[this.burstLoopType] ?? [];
      if (eventPool.length > 0) {
        for (let i = 0; i < this.burstLoopCount; i++) {
          this.burstQueue.push(eventPool[Math.floor(Math.random() * eventPool.length)]);
        }
      }
    }

    // 通常スポーン
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this.spawnFromPool();
      this.resetSpawnTimer();
    }
  }

  /**
   * コメント表示の ON/OFF を切り替える。
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      for (const c of this.activeComments) {
        c.text.destroy();
      }
      this.activeComments = [];
      this.burstQueue = [];
      this.burstLoopType = null;
    }
  }

  destroy(): void {
    for (const c of this.activeComments) {
      c.text.destroy();
    }
    this.activeComments = [];
    this.burstQueue = [];
    this.burstLoopType = null;
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  // -------------------------------------------------
  // private
  // -------------------------------------------------

  private spawnFromPool(): void {
    if (this.activePool.length === 0) return;
    const text = this.activePool[Math.floor(Math.random() * this.activePool.length)];
    this.spawnComment(text);
  }

  private spawnComment(commentText: string): void {
    const laneIndex = this.selectLane();
    if (laneIndex === -1) return; // 全レーン混雑

    const y = LANE_Y_POSITIONS[laneIndex];
    const textObj = this.scene.add
      .text(CANVAS_W + 20, y, commentText, {
        fontFamily: "LINE Seed JP, sans-serif",
        fontSize: FONT_SIZE,
        color: "#ffffff",
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: "#000000",
          blur: 3,
          fill: true,
        },
      })
      .setDepth(COMMENT_DEPTH)
      .setAlpha(COMMENT_ALPHA);

    const totalDistance = CANVAS_W + textObj.width;
    const speed = totalDistance / CROSSING_DURATION; // px/ms

    this.activeComments.push({ text: textObj, speed });

    // レーン進捗をリセット
    this.lanes[laneIndex].progressPx = 0;
    this.lanes[laneIndex].totalDistancePx = totalDistance;
  }

  /**
   * 投入可能なレーンを選択する。
   * 前コメントが LANE_FREE_THRESHOLD 以上進んでいるレーンの中から
   * 最も進んでいる（余裕のある）レーンを選ぶ。
   * @returns レーンインデックス、全混雑時は -1
   */
  private selectLane(): number {
    let bestIndex = -1;
    let bestProgress = -1;

    for (let i = 0; i < this.lanes.length; i++) {
      const lane = this.lanes[i];
      const progress = lane.totalDistancePx === 0
        ? 1
        : lane.progressPx / lane.totalDistancePx;
      if (progress >= LANE_FREE_THRESHOLD && progress > bestProgress) {
        bestProgress = progress;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  private resetSpawnTimer(): void {
    this.spawnTimer =
      SPAWN_INTERVAL_MIN +
      Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
  }
}
