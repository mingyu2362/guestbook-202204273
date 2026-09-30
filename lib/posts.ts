import { connection } from "next/server";
import { sql } from "./db";
import { POST_LIMITS } from "./post-limits";
import { hashPostPassword } from "./post-password";

export type PostField = keyof typeof POST_LIMITS;
export type FieldErrors = Partial<Record<PostField, string>>;

export type CreatePostResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; fieldErrors: FieldErrors };

export type Post = {
  id: string;
  name: string;
  message: string;
  createdAt: Date;
  updatedAt: Date | null;
};

type PostRow = {
  id: string;
  name: string;
  message: string;
  created_at: string | Date;
  updated_at: string | Date | null;
};

/** 모든 게시글을 최신 작성 순으로 돌려준다. 게시글 비밀번호 해시는 조회하지 않는다. */
export async function listPosts(): Promise<Post[]> {
  // 게시글은 자주 바뀌므로 빌드 시 prerender하지 않고 요청마다 읽는다.
  await connection();

  const rows = (await sql`
    SELECT id, name, message, created_at, updated_at
    FROM posts
    ORDER BY created_at DESC, id DESC
  `) as PostRow[];

  return rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    message: row.message,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at === null ? null : new Date(row.updated_at),
  }));
}

/** 게시글을 남긴다. 게시글 비밀번호는 해시로만 저장한다. */
export async function createPost(input: {
  name: string;
  message: string;
  password: string;
}): Promise<CreatePostResult> {
  const name = input.name.trim();
  const message = normalizeNewlines(input.message).trim();
  const password = input.password; // 게시글 비밀번호는 작성자가 정한 그대로 쓴다.

  const fieldErrors: FieldErrors = {};
  const nameError = checkLength("name", name);
  const messageError = checkLength("message", message);
  const passwordError = checkLength("password", password);
  if (nameError) fieldErrors.name = nameError;
  if (messageError) fieldErrors.message = messageError;
  if (passwordError) fieldErrors.password = passwordError;
  if (nameError || messageError || passwordError) {
    return { ok: false, reason: "invalid", fieldErrors };
  }

  const passwordHash = await hashPostPassword(password);
  await sql`
    INSERT INTO posts (name, message, password_hash)
    VALUES (${name}, ${message}, ${passwordHash})
  `;
  return { ok: true };
}

// 안내 문구에 쓸 목적격(을/를)과 주제격(은/는) 표현.
const FIELD_LABELS: Record<PostField, { object: string; topic: string }> = {
  name: { object: "이름을", topic: "이름은" },
  message: { object: "메시지를", topic: "메시지는" },
  password: { object: "게시글 비밀번호를", topic: "게시글 비밀번호는" },
};

/** 폼 제출은 줄바꿈을 CRLF로 보내므로 LF로 통일해 저장한다. */
function normalizeNewlines(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });

/** 사용자가 보는 문자 단위(한글, 이모지 포함)로 센 길이. */
function visibleLength(value: string): number {
  return Array.from(segmenter.segment(value)).length;
}

function checkLength(field: PostField, value: string): string | null {
  const { min, max } = POST_LIMITS[field];
  const label = FIELD_LABELS[field];
  const length = visibleLength(value);
  if (length === 0) return `${label.object} 입력해 주세요.`;
  if (length < min) return `${label.topic} ${min}자 이상이어야 합니다.`;
  if (length > max) return `${label.topic} ${max}자 이하여야 합니다.`;
  return null;
}
