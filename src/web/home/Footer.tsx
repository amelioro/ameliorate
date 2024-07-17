import { Typography } from "@mui/material";

import { NavLink } from "@/web/common/components/NavLink";
import {
  blogPage,
  contributingPage,
  discordInvite,
  discourseSessionsPage,
  facebookPage,
  feedbackPage,
  githubRepo,
  youtubeChannel,
} from "@/web/common/urls";

export const Footer = () => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 [&_a]:text-sm">
      <div className="flex flex-col">
        <Typography variant="h6">Ameliorate</Typography>
        <NavLink href="https://ameliorate.app/docs" target="_blank">
          Docs
        </NavLink>
        <NavLink href="https://ameliorate.app/docs/getting-started" target="_blank">
          Getting Started
        </NavLink>
        <NavLink href="/examples" target="_blank">
          Examples
        </NavLink>
        <NavLink href="https://ameliorate.app/docs/release-status" target="_blank">
          Release Status
        </NavLink>
      </div>

      <div className="flex flex-col">
        <Typography variant="h6">Community</Typography>
        <NavLink href={blogPage} target="_blank">
          Blog
        </NavLink>
        <NavLink href={githubRepo} target="_blank">
          GitHub
        </NavLink>
        <NavLink href={discordInvite} target="_blank">
          Discord
        </NavLink>
        <NavLink href={youtubeChannel} target="_blank">
          YouTube
        </NavLink>
        <NavLink href={facebookPage} target="_blank">
          Facebook
        </NavLink>
      </div>

      <div className="flex flex-col">
        <Typography variant="h6">Participate</Typography>
        <NavLink href={feedbackPage} target="_blank">
          Give Feedback
        </NavLink>
        <NavLink href={discourseSessionsPage} target="_blank">
          Discourse Sessions
        </NavLink>
        <NavLink href={contributingPage} target="_blank">
          Contributing
        </NavLink>
      </div>
    </div>
  );
};
