import { PageWrapper } from "./components/PageWrapper";
import { PostCard } from "./components/PostCard";
import { TagPill } from "./components/TagPill";
import { getPosts, getTags } from "./posts/get-posts";

export const metadata = {
  title: "Blog | Ameliorate",
};

export default async function AllPostsPage() {
  const tags = await getTags();
  const posts = await getPosts();
  const allTags = Object.fromEntries(
    Array.from(new Set(tags)).map((tag) => [tag, tags.filter((t) => t === tag).length]),
  );

  return (
    <PageWrapper>
      <h1>All Posts</h1>
      <p className="x:not-first:mt-[1.25em] x:leading-7">
        Want to get notified of new posts?{" "}
        <a href="https://amelioro.substack.com/" target="_blank" rel="noreferrer">
          Subscribe via Substack
        </a>
        .
      </p>
      <div className="x:mt-4 x:flex x:flex-wrap x:items-center x:gap-2">
        <span className="x:text-sm x:font-medium x:text-gray-500 dark:x:text-gray-400">Tags:</span>
        {Object.entries(allTags).map(([tag, count]) => (
          <TagPill key={tag} tag={tag} count={count} />
        ))}
      </div>
      <div className="x:mt-6 x:flex x:flex-col x:gap-5">
        {posts.map((post) => (
          <PostCard key={post.route} post={post} />
        ))}
      </div>
    </PageWrapper>
  );
}
