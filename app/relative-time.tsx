"use client";

import { useSyncExternalStore } from "react";
import { formatKstDateTime, formatRelativeTime } from "@/lib/format-time";

// 모든 시각 표시가 함께 쓰는 1분 간격 시계. 구독자가 있을 때만 돈다.
const TICK_MS = 60_000;
let now = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === null) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => now;
// 서버 렌더링과 hydration 중에는 null → KST 전체 시각을 그대로 보여 주어 불일치를 막는다.
const getServerSnapshot = () => null;

/** 작성 시각을 상대 시각으로 보여 주고, 마우스를 올리면 KST 전체 시각을 보여 준다. */
export function RelativeTime({ iso }: { iso: string }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const date = new Date(iso);
  const full = formatKstDateTime(date);

  return (
    <time dateTime={iso} title={full}>
      {current === null ? full : formatRelativeTime(date, new Date(current))}
    </time>
  );
}
