declare module 'js-sha3' {
  interface HashFunction {
    (message: string | ArrayBuffer): string;
    hex(message: string | ArrayBuffer): string;
    array(message: string | ArrayBuffer): number[];
    digest(message: string | ArrayBuffer): number[];
    arrayBuffer(message: string | ArrayBuffer): ArrayBuffer;
  }

  export const sha3_224: HashFunction;
  export const sha3_256: HashFunction;
  export const sha3_384: HashFunction;
  export const sha3_512: HashFunction;
  export const keccak_256: HashFunction;
  export const keccak_512: HashFunction;
}
