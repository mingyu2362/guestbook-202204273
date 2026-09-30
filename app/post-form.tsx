"use client";

import { useActionState, type ReactNode } from "react";
import { createPostAction, type CreatePostFormState } from "./actions";
import { useListNotice } from "./list-notice";
import { POST_LIMITS } from "@/lib/post-limits";

const initialState: CreatePostFormState = {
  fieldErrors: {},
  values: { name: "", message: "" },
};

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200 aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-100 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-100 dark:focus:border-amber-500 dark:focus:bg-stone-800 dark:focus:ring-amber-900/60 dark:aria-invalid:ring-red-950";

export function PostForm() {
  const { clearNotice } = useListNotice();
  const [state, formAction, pending] = useActionState(
    async (prev: CreatePostFormState, formData: FormData) => {
      const next = await createPostAction(prev, formData);
      clearNotice();
      return next;
    },
    initialState,
  );
  const { fieldErrors, values } = state;

  // React 19는 action 폼을 제출 후 초기화한다. 실패 시에는 돌려받은 값이 defaultValue가 되어 그대로 남고,
  // 성공 시에는 빈 값으로 초기화된다.
  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(120,90,50,0.06),0_6px_20px_-6px_rgba(120,90,50,0.12)] ring-1 ring-stone-200/70 sm:p-6 dark:bg-stone-900 dark:shadow-none dark:ring-stone-800"
    >
      <div className="flex flex-col gap-4 sm:flex-row">
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
        className="w-full rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-800 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-end dark:bg-amber-600 dark:hover:bg-amber-500 dark:focus-visible:ring-offset-stone-900"
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
    <label className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
        {label}
      </span>
      {children}
      {error && (
        <span role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}
