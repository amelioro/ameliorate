"use client";

import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { Link } from "nextra-theme-docs";
import LiteYouTubeEmbed from "react-lite-youtube-embed";

interface YouTubeProps {
  id: string;
  title: string;
}

export const YouTube = ({ id, title }: YouTubeProps) => {
  return (
    <div className="not-prose" style={{ margin: "1.5rem 0" }}>
      <LiteYouTubeEmbed id={id} title={title} />
      <div className="x:mt-2 x:text-sm x:text-center">
        <Link href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">
          Watch on YouTube
        </Link>
      </div>
    </div>
  );
};
