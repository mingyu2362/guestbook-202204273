// 게시글 비밀번호 해시 (docs/adr/0001). 게시글 모듈 내부에서만 쓴다.
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const SCHEME = "scrypt";
const SALT_BYTES = 16;
const KEY_BYTES = 64;

/** `scrypt$<salt hex>$<hash hex>` 형식의 문자열을 만든다. salt는 호출마다 새로 만든다. */
export async function hashPostPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await scryptAsync(password, salt, KEY_BYTES);
  return `${SCHEME}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

/** 저장된 값과 비교한다. 형식을 해석할 수 없으면 불일치로 본다. */
export async function verifyPostPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, saltHex, hashHex, ...rest] = stored.split("$");
  if (scheme !== SCHEME || !saltHex || !hashHex || rest.length > 0) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (salt.length !== SALT_BYTES || expected.length !== KEY_BYTES) return false;

  const actual = await scryptAsync(password, salt, KEY_BYTES);
  return timingSafeEqual(actual, expected);
}
