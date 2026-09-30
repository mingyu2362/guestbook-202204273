"use server";

import { revalidatePath } from "next/cache";
import {
  createPost,
  deletePost,
  updatePostMessage,
  type FieldErrors,
} from "@/lib/posts";

export type CreatePostFormState = {
  fieldErrors: FieldErrors;
  /** 실패했을 때 다시 채워 넣을 값. 게시글 비밀번호는 돌려주지 않는다. */
  values: { name: string; message: string };
};

export async function createPostAction(
  _prev: CreatePostFormState,
  formData: FormData,
): Promise<CreatePostFormState> {
  const name = text(formData, "name");
  const message = text(formData, "message");
  const password = text(formData, "password");

  const result = await createPost({ name, message, password });
  if (!result.ok) {
    return { fieldErrors: result.fieldErrors, values: { name, message } };
  }

  revalidatePath("/");
  return { fieldErrors: {}, values: { name: "", message: "" } };
}

/** 게시글 하나에 대한 수정·삭제 폼의 상태. */
export type PostMutationState = {
  status: "idle" | "ok" | "invalid" | "wrong-password" | "not-found";
  /** 화면에 보여 줄 안내. */
  notice: string | null;
  fieldErrors: FieldErrors;
  /** 수정이 실패했을 때 편집란에 다시 채워 넣을 메시지. */
  message: string | null;
};

const WRONG_PASSWORD = "게시글 비밀번호가 일치하지 않습니다.";
const NOT_FOUND = "이미 삭제되었거나 존재하지 않는 게시글입니다.";

export async function updatePostAction(
  _prev: PostMutationState,
  formData: FormData,
): Promise<PostMutationState> {
  const message = text(formData, "message");
  const result = await updatePostMessage({
    id: text(formData, "id"),
    message,
    password: text(formData, "password"),
  });

  if (result.ok) {
    revalidatePath("/");
    return { status: "ok", notice: null, fieldErrors: {}, message: null };
  }
  switch (result.reason) {
    case "invalid":
      return { status: "invalid", notice: null, fieldErrors: result.fieldErrors, message };
    case "wrong-password":
      return { status: "wrong-password", notice: WRONG_PASSWORD, fieldErrors: {}, message };
    case "not-found":
      revalidatePath("/");
      return { status: "not-found", notice: NOT_FOUND, fieldErrors: {}, message: null };
  }
}

export async function deletePostAction(
  _prev: PostMutationState,
  formData: FormData,
): Promise<PostMutationState> {
  const result = await deletePost({
    id: text(formData, "id"),
    password: text(formData, "password"),
  });

  if (result.ok) {
    revalidatePath("/");
    return { status: "ok", notice: null, fieldErrors: {}, message: null };
  }
  switch (result.reason) {
    case "wrong-password":
      return { status: "wrong-password", notice: WRONG_PASSWORD, fieldErrors: {}, message: null };
    case "not-found":
      revalidatePath("/");
      return { status: "not-found", notice: NOT_FOUND, fieldErrors: {}, message: null };
  }
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
