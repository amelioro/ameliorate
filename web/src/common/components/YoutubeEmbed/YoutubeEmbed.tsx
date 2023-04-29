import { StyledBox } from "./YoutubeEmbed.styles";

// thanks https://dev.to/bravemaster619/simplest-way-to-embed-a-youtube-video-in-your-react-app-3bk2
export const YoutubeEmbed = ({ embedId }: { embedId: string }) => (
  <StyledBox>
    <iframe src={`https://www.youtube.com/embed/${embedId}`} title="Embedded youtube video" />
  </StyledBox>
);
