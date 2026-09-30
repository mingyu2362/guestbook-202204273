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
