"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// 게시글 카드 밖(목록 위)에 띄우는 안내. "이미 삭제된 게시글" 안내는 목록을 새로 고치면
// 해당 카드가 사라지므로 카드 안이 아니라 여기에 표시한다.
// 어느 폼이든 다음 제출 결과가 오면 지운다. 같은 문구가 다시 와도 새 안내로 보이도록 id를 붙인다.
type Notice = { id: number; text: string };

type NoticeControls = {
  notice: Notice | null;
  showNotice: (text: string) => void;
  clearNotice: () => void;
};

const NoticeContext = createContext<NoticeControls>({
  notice: null,
  showNotice: () => {},
  clearNotice: () => {},
});

export function useListNotice() {
  return useContext(NoticeContext);
}

export function ListNoticeProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const showNotice = (text: string) =>
    setNotice((prev) => ({ id: (prev?.id ?? 0) + 1, text }));
  const clearNotice = () => setNotice(null);

  return (
    <NoticeContext.Provider value={{ notice, showNotice, clearNotice }}>
      {children}
    </NoticeContext.Provider>
  );
}

export function ListNotice() {
  const { notice, clearNotice } = useListNotice();
  if (!notice) return null;

  return (
    <div
      key={notice.id}
      role="status"
      className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
    >
      <span>{notice.text}</span>
      <button
        type="button"
        onClick={clearNotice}
        className="shrink-0 font-medium underline-offset-2 hover:underline"
      >
        닫기
      </button>
    </div>
  );
}
