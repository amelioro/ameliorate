import { Check } from "@mui/icons-material";
import { Button, InputBase, Typography } from "@mui/material";
import { ReactNode, useState } from "react";

interface Props {
  header: string;
  headerAnchor?: ReactNode;
  action: string;
  buttonText: string;
}

export const SubscribeForm = ({ header, headerAnchor, action, buttonText }: Props) => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex flex-col justify-center space-y-2 rounded-md border border-gray-300 p-4 pt-2 text-center">
      <Typography variant="body1">
        {header} {headerAnchor}
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
        <div className="flex flex-wrap justify-center gap-1">
          <InputBase
            placeholder="Type your email..."
            type="email"
            name="email"
            required
            className="max-w-52 grow rounded-sm border border-primary-main p-2 text-sm focus:outline-hidden"
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={submitted}
            className="shrink-0 rounded-sm text-nowrap shadow-none"
          >
            {submitted ? <Check /> : buttonText}
          </Button>
        </div>
      </form>

      {submitted && (
        <Typography variant="body2" marginBottom="0 !important">
          An email was sent to verify your email address.
        </Typography>
      )}
    </div>
  );
};
