/**
 * プレースホルダー PNG 生成スクリプト
 * 外部依存なし (Node.js 組み込みの zlib / fs / path のみ使用)
 * 使い方: node scripts/generate-placeholders.mjs
 */
import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/assets/sprites");
mkdirSync(OUT, { recursive: true });

// -------------------------------------------------
// PNG 最小エンコーダ
// -------------------------------------------------
function crc32(buf) {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  let crc = 0xffffffff;
  for (const b of buf) crc = (crc >>> 8) ^ table[(crc ^ b) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

/**
 * RGBA フラットピクセル配列から PNG Buffer を生成する
 * @param {Uint8Array} pixels RGBA順のフラット配列 (width * height * 4 bytes)
 * @param {number} width
 * @param {number} height
 */
function makePNG(pixels, width, height) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB (filter byte added manually below)
  // 実際は RGBA にするため color type = 6
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // raw data: filter byte(0x00) + RGBA per row
  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    raw[y * rowSize] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * rowSize + 1 + x * 4;
      raw[dst] = pixels[src];
      raw[dst + 1] = pixels[src + 1];
      raw[dst + 2] = pixels[src + 2];
      raw[dst + 3] = pixels[src + 3];
    }
  }

  const idat = deflateSync(raw, { level: 1 });

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // signature
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/**
 * 単色 PNG を生成して保存する
 * @param {string} filename
 * @param {number} width
 * @param {number} height
 * @param {[number,number,number,number]} rgba
 */
function saveSolid(filename, width, height, rgba) {
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    pixels[i * 4] = rgba[0];
    pixels[i * 4 + 1] = rgba[1];
    pixels[i * 4 + 2] = rgba[2];
    pixels[i * 4 + 3] = rgba[3];
  }
  writeFileSync(join(OUT, filename), makePNG(pixels, width, height));
  console.log(`  created: ${filename} (${width}x${height})`);
}

/**
 * スプライトシート PNG を生成する
 * フレームごとに色を少しずつ変えて視覚的に区別できるようにする
 */
function saveSpritesheet(filename, frameW, frameH, frameCount, baseRgba) {
  const width = frameW * frameCount;
  const height = frameH;
  const pixels = new Uint8Array(width * height * 4);

  for (let f = 0; f < frameCount; f++) {
    const brightness = Math.round(40 + (f / (frameCount - 1 || 1)) * 160);
    for (let y = 0; y < frameH; y++) {
      for (let x = 0; x < frameW; x++) {
        // 枠線(2px)を白、内側を色で塗る
        const border = x < 2 || x >= frameW - 2 || y < 2 || y >= frameH - 2;
        const px = (y * width + f * frameW + x) * 4;
        pixels[px] = border
          ? 255
          : Math.min(255, baseRgba[0] + brightness - 128);
        pixels[px + 1] = border
          ? 255
          : Math.min(255, baseRgba[1] + brightness - 128);
        pixels[px + 2] = border
          ? 255
          : Math.min(255, baseRgba[2] + brightness - 128);
        pixels[px + 3] = 255;
      }
    }
  }
  writeFileSync(join(OUT, filename), makePNG(pixels, width, height));
  console.log(
    `  created: ${filename} (${width}x${height}, ${frameCount} frames)`,
  );
}

// -------------------------------------------------
// 生成
// -------------------------------------------------
console.log("Generating placeholder assets...");

// Spritesheets (frame: 64x96 for characters, 64x64 for witch)
saveSpritesheet("player_run.png", 64, 96, 6, [80, 160, 240, 255]); // 青
saveSpritesheet("player_fall.png", 64, 96, 5, [80, 160, 240, 255]);
saveSpritesheet("player_goal.png", 64, 96, 5, [80, 160, 240, 255]);
saveSpritesheet("player_back_pain.png", 64, 96, 6, [100, 140, 200, 255]);
saveSpritesheet("enemy_run.png", 64, 96, 6, [220, 80, 80, 255]); // 赤
saveSpritesheet("witch_float.png", 64, 64, 3, [180, 80, 220, 255]); // 紫

// Static images
saveSolid("tax_office.png", 128, 128, [180, 140, 80, 255]); // 黄土色
saveSolid("receipt_1.png", 32, 48, [255, 255, 200, 255]); // 薄黄
saveSolid("receipt_2.png", 32, 48, [240, 255, 200, 255]); // 薄緑
saveSolid("receipt_3.png", 32, 48, [255, 240, 200, 255]); // 薄橙
saveSolid("stone_1.png", 48, 32, [160, 140, 120, 255]); // グレー茶
saveSolid("stone_2.png", 48, 32, [140, 120, 100, 255]);
saveSolid("stone_3.png", 48, 32, [120, 100, 80, 255]);

// Backgrounds (幅 2048 以上)
saveSolid("bg_far.png", 2048, 540, [135, 206, 250, 255]); // 空色
saveSolid("bg_near.png", 2048, 540, [100, 180, 100, 255]); // 緑
saveSolid("ground.png", 2048, 64, [120, 90, 60, 255]); // 茶

console.log("Done!");
