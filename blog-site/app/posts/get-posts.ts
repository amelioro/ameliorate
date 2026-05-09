import { normalizePages } from "nextra/normalize-pages";
import { getPageMap } from "nextra/page-map";

interface PostFrontMatter {
  date: string;
  description: string;
  tags: string[];
}

export interface Post {
  name: string;
  title: string;
  route: string;
  frontMatter: PostFrontMatter;
}

export async function getPosts(): Promise<Post[]> {
  const { directories } = normalizePages({
    list: await getPageMap("/posts"),
    route: "/posts",
  });
  return (directories as unknown as Post[])
    .filter((post) => post.name !== "index")
    .sort(
      (a, b) => new Date(b.frontMatter.date).getTime() - new Date(a.frontMatter.date).getTime(),
    );
}

export async function getTags(): Promise<string[]> {
  const posts = await getPosts();
  return posts.flatMap((post) => post.frontMatter.tags);
}
