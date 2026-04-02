import Link from "next/link";

interface TagPillProps {
  tag: string;
  count?: number;
}

export function TagPill({ tag, count }: TagPillProps) {
  return (
    <Link href={`/tags/${tag}`} className="tag-pill">
      {tag}
      {count != null && (
        <span className="x:ml-1.5 x:text-gray-400 x:dark:text-gray-500">({count})</span>
      )}
    </Link>
  );
}
