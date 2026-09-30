"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  deletePostAction,
  updatePostAction,
  type PostMutationState,
} from "./actions";
import { useListNotice } from "./list-notice";
import { POST_LIMITS } from "@/lib/post-limits";

type Mode = "edit" | "delete" | null;

const initialState: PostMutationState = {
  status: "idle",
  notice: null,
  fieldErrors: {},
  message: null,
};

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-100 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-100 dark:focus:border-amber-500 dark:focus:bg-stone-800 dark:focus:ring-amber-900/60 dark:aria-invalid:ring-red-950";
const primaryButton =
  "rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-800 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-600 dark:hover:bg-amber-500";
// 포인트 색을 하나로 통일한다. 빨간 톤은 오류 안내에만 쓴다.
const dangerButton = primaryButton;
const secondaryButton =
  "rounded-lg px-2.5 py-1 text-xs text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300";

/** 게시글 하나의 [수정]/[삭제] 버튼과 인라인 폼. 한 번에 한 모드만 펼친다. */
export function PostActions({ id, message }: { id: string; message: string }) {
  const [mode, setMode] = useState<Mode>(null);
  const close = () => setMode(null);

  if (mode === "edit") {
    return <EditForm id={id} message={message} onClose={close} />;
  }
  if (mode === "delete") {
    return <DeleteForm id={id} onClose={close} />;
  }
  return (
    <div className="mt-3 flex justify-end gap-0.5">
      <button type="button" onClick={() => setMode("edit")} className={secondaryButton}>
        수정
      </button>
      <button type="button" onClick={() => setMode("delete")} className={secondaryButton}>
        삭제
      </button>
    </div>
  );
}

/** 결과에 따라 폼을 닫거나(성공, 없는 게시글) 그대로 두는(비밀번호 불일치, 입력 오류) 액션. */
function useMutation(
  action: (prev: PostMutationState, formData: FormData) => Promise<PostMutationState>,
  onClose: () => void,
) {
  const { showNotice, clearNotice } = useListNotice();
  return useActionState(async (prev: PostMutationState, formData: FormData) => {
    const next = await action(prev, formData);
    if (next.status === "not-found" && next.notice) {
      showNotice(next.notice);
      onClose();
    } else {
      clearNotice();
      if (next.status === "ok") onClose();
    }
    return next;
  }, initialState);
}

function EditForm({
  id,
  message,
  onClose,
}: {
  id: string;
  message: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useMutation(updatePostAction, onClose);

  // React 19는 제출 후 폼을 초기화한다. 실패하면 돌려받은 메시지가 defaultValue가 되어 편집 내용이 남고,
  // 비밀번호 칸은 비워진다.
  return (
    <form action={formAction} className="mt-4 flex flex-col gap-2.5 border-t border-stone-100 pt-4 dark:border-stone-800">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="message"
        aria-label="수정할 메시지"
        defaultValue={state.message ?? message}
        required
        maxLength={POST_LIMITS.message.max}
        rows={3}
        aria-invalid={state.fieldErrors.message ? true : undefined}
        className={`${inputClass} resize-y`}
      />
      {state.fieldErrors.message && <Alert>{state.fieldErrors.message}</Alert>}
      <PasswordRow pending={pending} onCancel={onClose}>
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "저장 중…" : "저장"}
        </button>
      </PasswordRow>
      {state.status === "wrong-password" && state.notice && <Alert>{state.notice}</Alert>}
    </form>
  );
}

function DeleteForm({ id, onClose }: { id: string; onClose: () => void }) {
  const [state, formAction, pending] = useMutation(deletePostAction, onClose);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-2.5 border-t border-stone-100 pt-4 dark:border-stone-800">
      <input type="hidden" name="id" value={id} />
      <PasswordRow pending={pending} onCancel={onClose}>
        <button type="submit" disabled={pending} className={dangerButton}>
          {pending ? "삭제 중…" : "삭제 확인"}
        </button>
      </PasswordRow>
      {state.status === "wrong-password" && state.notice && <Alert>{state.notice}</Alert>}
    </form>
  );
}

function PasswordRow({
  pending,
  onCancel,
  children,
}: {
  pending: boolean;
  onCancel: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        name="password"
        type="password"
        aria-label="게시글 비밀번호"
        placeholder="게시글 비밀번호"
        required
        maxLength={POST_LIMITS.password.max}
        autoComplete="current-password"
        autoFocus
        className={`${inputClass} min-w-0 basis-full sm:basis-0 sm:flex-1`}
      />
      {children}
      <button type="button" onClick={onCancel} disabled={pending} className={secondaryButton}>
        취소
      </button>
    </div>
  );
}

function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900">
      {children}
    </p>
  );
}
