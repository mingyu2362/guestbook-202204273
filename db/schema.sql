-- 게시글 (Post). 게시글 비밀번호 저장 방식은 docs/adr/0001 참고.
CREATE TABLE IF NOT EXISTS posts (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          text        NOT NULL,
  message       text        NOT NULL,
  password_hash text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz
);

CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC);
