// News image entry for 24 November 2026: the program copies the front page
// held beside it to /output/entry.png. No network, no drawing, no randomness —
// the same bytes every run, so both grader runs write identical output.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576;
const MAX_PIXELS = 1024;

function readPngSize(path: string): { width: number; height: number } {
  // PNG header: 8-byte signature, then the IHDR chunk with width/height
  // as big-endian 32-bit integers at offsets 16 and 20.
  const head = readFileSync(path).subarray(0, 24);
  return {
    width: head.readUInt32BE(16),
    height: head.readUInt32BE(20),
  };
}

function main(): void {
  const source = fileURLToPath(new URL("./entry.png", import.meta.url));
  // Validate before copying: a too-big file must fail here, not after a
  // bad entry.png has already been written to the output directory.
  const size = readPngSize(source);
  if (size.width > MAX_PIXELS || size.height > MAX_PIXELS) {
    throw new Error(
      `entry.png is ${size.width}x${size.height}, over the ${MAX_PIXELS}x${MAX_PIXELS} limit`,
    );
  }
  const bytes = statSync(source).size;
  if (bytes > MAX_BYTES) {
    throw new Error(`entry.png is ${bytes} bytes, over the 1 MiB limit`);
  }
  const targetDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  copyFileSync(source, join(targetDir, "entry.png"));
}

main();
