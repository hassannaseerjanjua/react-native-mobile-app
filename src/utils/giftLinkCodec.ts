/**
 * Encode/decode gift link params for profile "My Gift Link" sharing.
 * Obfuscates friendUserId, CityId, sendType so the URL doesn't expose raw IDs.
 * Format: t=gl_<base64> — supports backward compatibility with legacy ?friendUserId=&CityId=&sendType=
 */

const PREFIX = 'gl_';
const XOR_KEY = 0x5a; // Simple XOR key for extra obfuscation

function xorTransform(str: string, key: number): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ key);
  }
  return result;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64Encode(str: string): string {
  let result = '';
  let i = 0;
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    const n = (a << 16) | (b << 8) | c;
    result += B64[(n >>> 18) & 63] + B64[(n >>> 12) & 63] + B64[(n >>> 6) & 63] + B64[n & 63];
  }
  const pad = str.length % 3;
  return pad ? result.slice(0, pad - 3) : result; // pad 1→-2 chars, pad 2→-1 char
}

function base64Decode(str: string): string {
  const lookup: Record<string, number> = {};
  for (let i = 0; i < B64.length; i++) lookup[B64[i]] = i;
  let result = '';
  str = str.replace(/[^A-Za-z0-9+/=]/g, '');
  for (let i = 0; i + 4 <= str.length; i += 4) {
    const n =
      (lookup[str[i]] ?? 0) << 18 |
      (lookup[str[i + 1]] ?? 0) << 12 |
      (lookup[str[i + 2]] ?? 0) << 6 |
      (lookup[str[i + 3]] ?? 0);
    result += String.fromCharCode((n >>> 16) & 255, (n >>> 8) & 255, n & 255);
  }
  return result.replace(/\0+$/, '');
}

export interface GiftLinkParams {
  friendUserId: number;
  CityId: number;
  sendType: number;
}

/**
 * Encode gift link params into an obfuscated token.
 * Use in profile share: ?t=gl_<encoded>
 */
export function encodeGiftLinkParams(params: GiftLinkParams): string {
  const payload = JSON.stringify({
    f: params.friendUserId,
    c: params.CityId,
    s: params.sendType,
  });
  const xored = xorTransform(payload, XOR_KEY);
  return PREFIX + base64Encode(xored);
}

/**
 * Decode gift link token back to params.
 * Returns null if invalid.
 */
export function decodeGiftLinkParams(token: string): GiftLinkParams | null {
  if (!token || !token.startsWith(PREFIX)) {
    return null;
  }
  try {
    const encoded = token.slice(PREFIX.length);
    const xored = base64Decode(encoded);
    const payload = xorTransform(xored, XOR_KEY);
    const parsed = JSON.parse(payload);
    if (
      typeof parsed.f !== 'number' ||
      typeof parsed.c !== 'number' ||
      typeof parsed.s !== 'number'
    ) {
      return null;
    }
    return {
      friendUserId: parsed.f,
      CityId: parsed.c,
      sendType: parsed.s,
    };
  } catch {
    return null;
  }
}
