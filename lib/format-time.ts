const kstParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function partsOf(date: Date) {
  const parts = Object.fromEntries(
    kstParts.formatToParts(date).map((p) => [p.type, p.value]),
  );
  return parts as Record<"year" | "month" | "day" | "hour" | "minute", string>;
}

/** 실행 환경의 시간대와 관계없이 한국 시각 기준 `YYYY-MM-DD HH:mm (KST)`. */
export function formatKstDateTime(date: Date): string {
  const p = partsOf(date);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute} (KST)`;
}

/** 한국 시각 기준 날짜 `YYYY-MM-DD`. */
export function formatKstDate(date: Date): string {
  const p = partsOf(date);
  return `${p.year}-${p.month}-${p.day}`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * `now` 기준으로 `date`가 얼마나 지났는지 나타낸다. 현재 시각을 스스로 읽지 않는 순수 함수다.
 * 방금 전 → N분 전 → N시간 전 → N일 전(버림) → 7일부터는 KST 날짜.
 * 미래 시각(서버와 브라우저의 시계 차이)은 "방금 전"으로 본다.
 */
export function formatRelativeTime(date: Date, now: Date): string {
  const elapsed = now.getTime() - date.getTime();
  if (elapsed < MINUTE) return "방금 전";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}분 전`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}시간 전`;
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)}일 전`;
  return formatKstDate(date);
}
