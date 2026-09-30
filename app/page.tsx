import { formatKstDateTime } from "@/lib/format-time";
import { listPosts, type Post } from "@/lib/posts";

export default async function Home() {
  const posts = await listPosts();

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            방명록
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            조민규 · 202204273
          </p>
        </header>

        <section aria-label="게시글 목록">
          {posts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-10 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              아직 게시글이 없습니다. 첫 게시글을 남겨 보세요.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {posts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function PostItem({ post }: { post: Post }) {
  return (
    <li className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {post.name}
        </span>
        <time
          dateTime={post.createdAt.toISOString()}
          className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400"
        >
          {formatKstDateTime(post.createdAt)}
        </time>
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-zinc-700 dark:text-zinc-300">
        {post.message}
      </p>
    </li>
  );
}
