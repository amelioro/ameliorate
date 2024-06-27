import { Box, Divider, Link as MuiLink, Typography } from "@mui/material";

import { SubscribeForm } from "@/web/common/components/SubscribeForm/SubscribeForm";

export const ImprovingSection = () => {
  return (
    <div className="flex flex-col items-center">
      <Typography variant="h4">Ameliorate is constantly improving</Typography>
      <Typography variant="body1">
        and would love your [feedback]! Check out what's coming up in the [backlog].
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        border="1px solid rgba(0,0,0,0.12)"
        borderRadius={1}
        marginTop={8}
      >
        <SubscribeForm
          header="Get progress updates"
          headerAnchor={<MuiLink href="https://amelioro.substack.com/">(blog)</MuiLink>}
          action="https://amelioro.substack.com/api/v1/free"
          buttonText="Subscribe"
        />

        <Divider />

        <SubscribeForm
          header="Get invited to future"
          headerAnchor={
            <MuiLink href="https://ameliorate.app/docs/discourse-sessions">
              discourse sessions
            </MuiLink>
          }
          action="https://buttondown.email/api/emails/embed-subscribe/ameliorate-discourse"
          buttonText="Invite me"
        />
      </Box>
    </div>
  );
};
