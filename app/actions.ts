"use server";

import { revalidatePath } from "next/cache";
import { createPost, type FieldErrors } from "@/lib/posts";

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

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
