import { formatKstDateTime } from "@/lib/format-time";
import { listPosts, type Post } from "@/lib/posts";
import { ListNotice, ListNoticeProvider } from "./list-notice";
import { PostActions } from "./post-actions";
import { PostForm } from "./post-form";
import { RelativeTime } from "./relative-time";

export default async function Home() {
  const posts = await listPosts();

  return (
    <div className="flex flex-1 justify-center bg-[#f7f1e6] px-4 py-10 sm:py-16 dark:bg-stone-950">
      <main className="flex w-full max-w-2xl flex-col gap-6 sm:gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-800 sm:text-5xl dark:text-stone-100">
            방명록
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            조민규 · 202204273
          </p>
        </header>

        <ListNoticeProvider>
          <PostForm />

          <section aria-label="게시글 목록">
            <ListNotice />
            {posts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-white/50 px-4 py-12 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-400">
                아직 게시글이 없습니다. 첫 게시글을 남겨 보세요.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {posts.map((post) => (
                  <PostItem key={post.id} post={post} />
                ))}
              </ul>
            )}
          </section>
        </ListNoticeProvider>
      </main>
    </div>
  );
}

function PostItem({ post }: { post: Post }) {
  return (
    <li className="rounded-2xl bg-white px-5 py-4 shadow-[0_1px_2px_rgba(120,90,50,0.06),0_6px_20px_-6px_rgba(120,90,50,0.12)] ring-1 ring-stone-200/70 sm:px-6 sm:py-5 dark:bg-stone-900 dark:shadow-none dark:ring-stone-800">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="min-w-0 font-semibold break-words text-stone-800 dark:text-stone-100">
          {post.name}
        </span>
        <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">
          <RelativeTime iso={post.createdAt.toISOString()} />
          {post.updatedAt && (
            <time
              dateTime={post.updatedAt.toISOString()}
              title={`수정: ${formatKstDateTime(post.updatedAt)}`}
              className="ml-1"
            >
              (수정됨)
            </time>
          )}
        </span>
      </div>
      <p className="mt-2 leading-relaxed whitespace-pre-wrap break-words text-stone-600 dark:text-stone-300">
        {post.message}
      </p>
      <PostActions id={post.id} message={post.message} />
    </li>
  );
}
