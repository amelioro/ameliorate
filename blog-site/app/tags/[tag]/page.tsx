import { PageWrapper } from "../../components/PageWrapper";
import { PostCard } from "../../components/PostCard";
import { getPosts, getTags } from "../../posts/get-posts";

export async function generateMetadata(props: { params: Promise<{ tag: string }> }) {
  const params = await props.params;
  return {
    title: `Posts Tagged with "${decodeURIComponent(params.tag)}"`,
  };
}

export async function generateStaticParams() {
  const allTags = await getTags();
  return Array.from(new Set(allTags)).map((tag) => ({ tag }));
}

export default async function TagPage(props: { params: Promise<{ tag: string }> }) {
  const params = await props.params;
  const { title } = await generateMetadata({ params: props.params });
  const posts = await getPosts();
  return (
    <PageWrapper>
      <h1>{title}</h1>
      <div className="x:mt-6 x:flex x:flex-col x:gap-5">
        {posts
          .filter((post) => post.frontMatter.tags.includes(decodeURIComponent(params.tag)))
          .map((post) => (
            <PostCard key={post.route} post={post} />
          ))}
      </div>
    </PageWrapper>
  );
}
