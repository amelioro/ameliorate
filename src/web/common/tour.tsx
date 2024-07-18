import { StepType } from "@reactour/tour";

import { Link } from "@/web/common/components/Link";
import { discordInvite, gettingStartedPage } from "@/web/common/urls";

export const steps: StepType[] = [
  {
    selector: '[data-tour="docs"]',
    content: (
      <span>
        Welcome to Ameliorate!
        <br />
        <br />
        If you want to learn more about the tool, you can find documentation here (
        <Link href={gettingStartedPage} target="_blank">
          Getting Started
        </Link>{" "}
        is a good first section to read).
        <br />
        <br />
        Feel free to also ask for help in the{" "}
        <Link href={discordInvite} target="_blank">
          Discord server
        </Link>
        .
      </span>
    ),
  },
];
