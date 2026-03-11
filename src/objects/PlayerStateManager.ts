/**
 * プレーヤーの状態フラグと状態遷移を管理する純粋クラス。
 * Phaser への依存を持たないため、単体テスト可能。
 *
 * 状態一覧:
 *   S1 running           grounded=true,  isBackPain=false, falling=false, gameOver=false
 *   S2 back_pain_ground  grounded=true,  isBackPain=true,  falling=false, gameOver=false
 *   S3 jumping           grounded=false, isBackPain=false, falling=false, gameOver=false
 *   S4 jumping_back_pain grounded=false, isBackPain=true,  falling=false, gameOver=false
 *   S5 falling           falling=true,   gameOver=false
 *   S6 goal              gameOver=true,  falling=false
 *   S7 enemy_caught      gameOver=true
 */

/** 状態遷移後にPlayerが実行すべきアニメーションアクション */
export type AnimAction =
  | "play_run"
  | "play_back_pain"
  | "play_back_pain_frame0"
  | "play_fall"
  | "play_goal"
  | "reset_scale_and_play_goal"
  | "reset_scale_and_play_fall"
  | "reset_scale_and_stop"
  | "none";

export class PlayerStateManager {
  private _grounded = false;
  private _isBackPain = false;
  private _falling = false;
  private _gameOver = false;
  private _pendingChargeOnLand = false;

  // -------------------------------------------------
  // ゲッター
  // -------------------------------------------------
  get grounded(): boolean {
    return this._grounded;
  }
  get isBackPain(): boolean {
    return this._isBackPain;
  }
  get falling(): boolean {
    return this._falling;
  }
  get gameOver(): boolean {
    return this._gameOver;
  }
  get pendingChargeOnLand(): boolean {
    return this._pendingChargeOnLand;
  }

  // -------------------------------------------------
  // 状態遷移
  // -------------------------------------------------

  /**
   * 空中でのボタン押下（バッファ登録）
   * 空中かつゲーム中の場合に pendingChargeOnLand フラグを立てる。
   */
  onPressInAir(): void {
    if (this._grounded || this._gameOver || this._falling) return;
    this._pendingChargeOnLand = true;
  }

  /**
   * 空中でのボタンリリース（バッファキャンセル）
   */
  onReleaseInAir(): void {
    this._pendingChargeOnLand = false;
  }

  /**
   * 着地時チャージバッファの消費
   * フラグを読んで即 false にリセットし、元の値を返す。
   */
  consumePendingCharge(): boolean {
    const pending = this._pendingChargeOnLand;
    this._pendingChargeOnLand = false;
    return pending;
  }

  /**
   * ジャンプ発動（S1→S3 / S2→S4）
   * アニメーションの停止と scaleリセットは呼び出し側が行う。
   */
  onJump(): void {
    this._grounded = false;
  }

  /**
   * 着地（S3→S1 / S4→S2）
   * falling または gameOver のときは無視する。
   * @returns 再生すべきアニメーション。無視された場合は "none"
   */
  onLanded(): AnimAction {
    if (this._falling || this._gameOver) return "none";
    this._grounded = true;
    return this._isBackPain ? "play_back_pain" : "play_run";
  }

  /**
   * 石ころ接触による転倒（S1/S2/S3/S4 → S5）
   * gameOver または falling のときは無視する。
   * @returns 実行すべきアクション
   */
  triggerFall(): AnimAction {
    if (this._gameOver || this._falling) return "none";
    this._falling = true;
    this._pendingChargeOnLand = false;
    return "reset_scale_and_play_fall";
  }

  /**
   * ゴール到達（S1/S2/S3/S4 → S6）
   * @returns 実行すべきアクション
   */
  triggerGoal(): AnimAction {
    if (this._gameOver) return "none";
    this._gameOver = true;
    this._pendingChargeOnLand = false;
    return "reset_scale_and_play_goal";
  }

  /**
   * 敵到達によるゲームオーバー（S1/S2/S3/S4 → S7 / S5 → S7）
   * S7 は現在フレームで固定。falling=true のときは sprite を変更しない。
   * @returns 実行すべきアクション
   */
  triggerEnemyCaught(): AnimAction {
    if (this._gameOver) return "none";
    this._gameOver = true;
    this._pendingChargeOnLand = false;
    if (!this._falling) {
      // scaleをリセットしてアニメーションを停止（現在フレームで固定）
      return "reset_scale_and_stop";
    }
    // S5経由: player_fall 最終フレームを維持
    return "none";
  }

  /**
   * 魔女接触による腰痛発動（S1→S2 / S2タイマー再セット / S3→S4 / S4タイマー再セット）
   * @returns 実行すべきアニメーションアクション
   */
  activateBackPain(): AnimAction {
    if (this._gameOver || this._falling) return "none";
    this._isBackPain = true;
    if (this._grounded) {
      return "play_back_pain";
    }
    // 空中被弾: back_pain の 1フレーム目を表示して停止
    return "play_back_pain_frame0";
  }

  /**
   * 腰痛タイマー満了（S2→S1 / S4→S3）
   * @returns 地上かつゲーム中であれば "play_run"、それ以外は "none"
   */
  deactivateBackPain(): AnimAction {
    this._isBackPain = false;
    if (!this._gameOver && !this._falling && this._grounded) {
      return "play_run";
    }
    return "none";
  }

  // -------------------------------------------------
  // テスト・デバッグ用セッター
  // テスト以外では直接使用しないこと
  // -------------------------------------------------
  _setGrounded(v: boolean): void {
    this._grounded = v;
  }
  _setFalling(v: boolean): void {
    this._falling = v;
  }
  _setGameOver(v: boolean): void {
    this._gameOver = v;
  }
  _setBackPain(v: boolean): void {
    this._isBackPain = v;
  }
  _setPendingChargeOnLand(v: boolean): void {
    this._pendingChargeOnLand = v;
  }
}
