import { sha3_384 } from 'js-sha3';
import { encodeBase61 } from '../data/base61';

/** sha3_384 digest → base61 (not hex / base64); never send plaintext. */
export function fingerprintOfPassword(password: string): string {
  const digest = sha3_384.array(password);
  return encodeBase61(digest);
}
