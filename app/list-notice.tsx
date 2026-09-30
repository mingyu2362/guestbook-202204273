"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// 게시글 카드 밖(목록 위)에 띄우는 안내. "이미 삭제된 게시글" 안내는 목록을 새로 고치면
// 해당 카드가 사라지므로 카드 안이 아니라 여기에 표시한다.
const NoticeContext = createContext<(notice: string) => void>(() => {});

export function useListNotice() {
  return useContext(NoticeContext);
}

export function ListNoticeProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <NoticeContext.Provider value={setNotice}>
      {notice && (
        <div
          role="status"
          className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="shrink-0 font-medium underline-offset-2 hover:underline"
          >
            닫기
          </button>
        </div>
      )}
      {children}
    </NoticeContext.Provider>
  );
}
