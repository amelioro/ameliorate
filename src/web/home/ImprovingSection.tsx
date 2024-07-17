import { Link as MuiLink, Typography } from "@mui/material";

import { Link } from "@/web/common/components/Link";
import { SubscribeForm } from "@/web/common/components/SubscribeForm/SubscribeForm";
import { blogPage, discourseSessionsPage } from "@/web/common/urls";

export const ImprovingSection = () => {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex flex-col items-center">
        <Typography variant="h4">Ameliorate is constantly improving</Typography>
        <Typography variant="body1">
          and would love your{" "}
          <Link
            href="https://github.com/amelioro/ameliorate/blob/main/CONTRIBUTING.md#providing-feedback"
            target="_blank"
          >
            feedback
          </Link>
          ! Check out what's coming up in the{" "}
          <Link href="https://github.com/orgs/amelioro/projects/2/views/1" target="_blank">
            backlog
          </Link>
          .
        </Typography>
      </div>

      <div className="flex flex-col divide-y divide-gray-300 rounded-md border border-gray-300 sm:flex-row sm:divide-x sm:divide-y-0">
        <SubscribeForm
          header="Get progress updates"
          headerAnchor={
            <MuiLink href={blogPage} target="_blank">
              (blog)
            </MuiLink>
          }
          action="https://amelioro.substack.com/api/v1/free"
          buttonText="Subscribe"
        />

        <SubscribeForm
          header="Get invited to future"
          headerAnchor={
            <MuiLink href={discourseSessionsPage} target="_blank">
              discourse sessions
            </MuiLink>
          }
          action="https://buttondown.email/api/emails/embed-subscribe/ameliorate-discourse"
          buttonText="Invite me"
        />
      </div>
    </div>
  );
};
