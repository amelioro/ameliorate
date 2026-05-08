import Link from "next/link";

import type { Post } from "../posts/get-posts";

export function PostCard({ post }: { post: Post }) {
  const formattedDate = new Date(post.frontMatter.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={post.route} className="post-card-link">
      <div className="post-card">
        <h3 className="x:m-0 x:text-lg x:font-semibold post-card-title">{post.title}</h3>
        <div className="x:mt-1.5 x:flex x:flex-wrap x:items-center x:gap-x-2 x:gap-y-1 x:text-sm x:text-gray-400 x:dark:text-gray-500">
          <time>{formattedDate}</time>
        </div>
        {post.frontMatter.description && (
          <p className="x:mt-2.5 x:text-sm x:leading-normal x:m-0 post-card-description">
            {post.frontMatter.description}
          </p>
        )}
      </div>
    </Link>
  );
}
