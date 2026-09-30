import { connection } from "next/server";
import { sql } from "./db";

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
