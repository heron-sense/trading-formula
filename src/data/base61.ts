/** Base61 codec — mirrors src/data/base61.v (utils.encode / utils.decode). */
const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy';

export function encodeBase61(raw: Uint8Array | number[]): string {
  const bytes = raw instanceof Uint8Array ? raw : Uint8Array.from(raw);
  const segsInRaw = bytes.length * 2;
  const result: string[] = [];

  for (let pos = 0; pos + 3 <= segsInRaw; pos += 3) {
    let frame: number;
    if (pos % 2 === 0) {
      frame = (bytes[pos / 2] << 4) | (bytes[pos / 2 + 1] >> 4);
    } else {
      frame = ((bytes[Math.floor(pos / 2)] & 0x0f) << 8) | bytes[Math.floor(pos / 2) + 1];
    }

    result.push(DIGITS[Math.floor(frame / 3721)]);
    frame %= 3721;
    result.push(DIGITS[Math.floor(frame / 61)]);
    frame %= 61;
    result.push(DIGITS[frame]);
  }

  const remainingSegs = segsInRaw % 3;
  if (remainingSegs !== 0) {
    result.push('z');

    let frame = bytes[bytes.length - 1];
    if (remainingSegs === 1) {
      frame = frame & 0x0f;
      result.push('z');
    }
    // First seg is padding → encode 0
    result.push(DIGITS[0]);
    result.push(DIGITS[Math.floor(frame / 61)]);
    result.push(DIGITS[frame % 61]);
  }

  return result.join('');
}
