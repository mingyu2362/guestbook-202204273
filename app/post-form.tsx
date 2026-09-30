"use client";

import { useActionState, type ReactNode } from "react";
import { createPostAction, type CreatePostFormState } from "./actions";
import { POST_LIMITS } from "@/lib/post-limits";

const initialState: CreatePostFormState = {
  fieldErrors: {},
  values: { name: "", message: "" },
};

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500 aria-invalid:border-red-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function PostForm() {
  const [state, formAction, pending] = useActionState(
    createPostAction,
    initialState,
  );
  const { fieldErrors, values } = state;

  // React 19는 action 폼을 제출 후 초기화한다. 실패 시에는 돌려받은 값이 defaultValue가 되어 그대로 남고,
  // 성공 시에는 빈 값으로 초기화된다.
  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <Field label="이름" error={fieldErrors.name} className="sm:flex-1">
          <input
            name="name"
            defaultValue={values.name}
            required
            maxLength={POST_LIMITS.name.max}
            autoComplete="nickname"
            aria-invalid={fieldErrors.name ? true : undefined}
            className={inputClass}
          />
        </Field>
        <Field
          label="게시글 비밀번호"
          error={fieldErrors.password}
          className="sm:flex-1"
        >
          <input
            name="password"
            type="password"
            required
            maxLength={POST_LIMITS.password.max}
            autoComplete="new-password"
            aria-invalid={fieldErrors.password ? true : undefined}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="메시지" error={fieldErrors.message}>
        <textarea
          name="message"
          defaultValue={values.message}
          required
          maxLength={POST_LIMITS.message.max}
          rows={3}
          aria-invalid={fieldErrors.message ? true : undefined}
          className={`${inputClass} resize-y`}
        />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "등록 중…" : "등록"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      {children}
      {error && (
        <span role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}
