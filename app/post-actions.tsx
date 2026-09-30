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
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const primaryButton =
  "rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300";
const dangerButton =
  "rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800";

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
    <div className="mt-2 flex justify-end gap-1">
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
    <form action={formAction} className="mt-3 flex flex-col gap-2">
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
    <form action={formAction} className="mt-3 flex flex-col gap-2">
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
        className={`${inputClass} min-w-0 flex-1`}
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
    <p role="alert" className="text-sm text-red-600 dark:text-red-400">
      {children}
    </p>
  );
}
