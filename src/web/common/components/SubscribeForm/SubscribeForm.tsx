import { Check } from "@mui/icons-material";
import { Box, Button, InputBase, Typography, useTheme } from "@mui/material";
import { ReactNode, useState } from "react";

interface Props {
  header: string;
  headerAnchor?: ReactNode;
  action: string;
  buttonText: string;
}

export const SubscribeForm = ({ header, headerAnchor, action, buttonText }: Props) => {
  const theme = useTheme();
  const [submitted, setSubmitted] = useState(false);

  return (
    <Box display="flex" flexDirection="column" margin={2} marginTop={0}>
      <Typography variant="body1">
        {header}
        {headerAnchor}
      </Typography>

      <iframe name="hidden_iframe" title="hidden_iframe" style={{ display: "none" }} />

      <form
        action={action}
        method="post"
        // prevent redirect https://stackoverflow.com/a/28060195/8409296
        target="hidden_iframe"
        style={{ display: "flex", justifyContent: "center" }}
        onSubmit={() => setSubmitted(true)}
      >
        <Box display="flex" justifyContent="center">
          <InputBase
            placeholder="Type your email..."
            type="email"
            name="email"
            required
            sx={{
              border: `1px solid ${theme.palette.primary.main}`,
              borderTopLeftRadius: "4px",
              borderBottomLeftRadius: "4px",
              padding: "8px",
              fontFamily: theme.typography.body1.fontFamily,
              fontSize: "14px",
              width: "200px",

              ":focus": { outline: "none" },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={submitted}
            sx={{ boxShadow: "none", borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }}
          >
            {submitted ? <Check /> : buttonText}
          </Button>
        </Box>
      </form>

      {submitted && (
        <Typography variant="body2" marginBottom="0 !important">
          An email was sent to verify your email address.
        </Typography>
      )}
    </Box>
  );
};
