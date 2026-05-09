import { Link } from "nextra-theme-docs";

import { PageWrapper } from "./components/PageWrapper";
import { PostCard } from "./components/PostCard";
import { getPosts } from "./posts/get-posts";

export const metadata = {
  title: "Blog | Ameliorate",
};

export default async function AllPostsPage() {
  const posts = await getPosts();

  return (
    <PageWrapper>
      <h1>All Posts</h1>

      <p className="x:mb-3">
        Want to get notified of new posts? Subscribe via{" "}
        <Link href="https://amelioro.substack.com/" target="_blank" rel="noreferrer">
          Substack
        </Link>{" "}
        (or <Link href="/rss.xml">RSS</Link>
        ).
      </p>

      <div className="x:flex x:flex-col x:gap-3">
        {posts.map((post) => (
          <PostCard key={post.route} post={post} />
        ))}
      </div>
    </PageWrapper>
  );
}
