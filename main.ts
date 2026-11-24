// News image entry for 24 November 2026.
// The front page in entry.png sums up that day's world news in a single
// image: one front page, not a collage of separate stories.
// The program copies the front page held beside it to /output/entry.png.
// No network, no drawing, no randomness: the same bytes every run, so
// both grader runs write identical output.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576;
const MAX_SIDE = 1024;
const SOURCE_NAME = "entry.png";
const OUTPUT_NAME = "entry.png";

function pngDimensions(path: string): { width: number; height: number } {
  // PNG header: 8-byte signature, then the IHDR chunk, with width and
  // height as big-endian 32-bit integers at offsets 16 and 20.
  const head = readFileSync(path).subarray(0, 24);
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
}

function checkImage(path: string): void {
  const { width, height } = pngDimensions(path);
  if (width > MAX_SIDE || height > MAX_SIDE) {
    throw new Error(
      `${SOURCE_NAME} is ${width}x${height}, over the ${MAX_SIDE}x${MAX_SIDE} limit`,
    );
  }
  const bytes = statSync(path).size;
  if (bytes > MAX_BYTES) {
    throw new Error(`${SOURCE_NAME} is ${bytes} bytes, over the 1 MiB limit`);
  }
}

function main(): void {
  const source = fileURLToPath(new URL(`./${SOURCE_NAME}`, import.meta.url));
  // Validate before copying: a too-big file must fail here, not after a
  // bad image has already been written to the output directory.
  checkImage(source);
  const targetDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  copyFileSync(source, join(targetDir, OUTPUT_NAME));
}

main();
