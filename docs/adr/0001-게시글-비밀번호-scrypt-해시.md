# 게시글 비밀번호는 salt를 포함한 scrypt 해시로 저장한다

회원 계정이 없어서 게시글 비밀번호가 수정·삭제 권한을 증명하는 유일한 수단이다. 작성자가 다른 서비스에서 쓰는 비밀번호를 재사용할 수 있으므로 DB가 유출되어도 원문이 드러나지 않아야 한다. 그래서 초기 논의에서 고른 평문 저장을 버리고, `posts.password_hash` 컬럼 하나에 `scrypt$<salt hex>$<hash hex>` 형식으로 저장하기로 했다. salt는 게시글마다 `crypto.randomBytes(16)`로 만들고, hash는 `crypto.scrypt(password, salt, 64)`로 만든다. 모두 `node:crypto`만 쓰므로 추가 의존성이 없다.

## Considered Options

- **평문 저장**: 구현은 가장 단순하고 SQL `WHERE password = $1` 한 줄로 비교할 수 있지만, 유출 시 비밀번호가 그대로 드러난다.
- **bcrypt 패키지**: 안전성은 충분하지만 네이티브 또는 추가 의존성이 생긴다. `node:crypto`의 scrypt로 같은 목적을 달성할 수 있다.
- **salt를 별도 컬럼에 저장**: 형식 접두사(`scrypt$`)가 있는 단일 문자열이 알고리즘 교체와 마이그레이션에 더 유리하다.

## Consequences

- 비밀번호 비교는 SQL 안에서 할 수 없다. 서버에서 `id`로 `password_hash`를 조회하고 `timingSafeEqual`로 비교한 뒤 UPDATE나 DELETE를 실행한다. 조회된 행이 없으면 "존재하지 않는 게시글"로, 비교가 불일치하면 "비밀번호 불일치"로 구분해 안내한다.
- 목록 조회 쿼리는 `password_hash`를 SELECT하지 않는다.
- 게시글 비밀번호를 잊으면 복구하거나 재설정할 방법이 없다(범위 밖).
