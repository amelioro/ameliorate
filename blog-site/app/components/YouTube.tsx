"use client";

import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import LiteYouTubeEmbed from "react-lite-youtube-embed";

interface YouTubeProps {
  id: string;
  title: string;
}

export const YouTube = ({ id, title }: YouTubeProps) => {
  return (
    <div className="not-prose" style={{ margin: "1.5rem 0" }}>
      <LiteYouTubeEmbed id={id} title={title} />
    </div>
  );
};
