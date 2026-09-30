// db/schema.sql을 DATABASE_URL의 DB에 적용한다. 여러 번 실행해도 안전하다.
// 사용: npm run db:init
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL이 설정되지 않았습니다. .env.local을 확인하세요.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");

// Neon HTTP 드라이버는 요청 하나에 문장 하나만 실행하므로 나눠서 보낸다.
const statements = schema
  .split(";")
  .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`스키마 적용 완료 (${statements.length}개 문장)`);
