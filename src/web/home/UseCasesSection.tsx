import { Typography } from "@mui/material";

import { Card } from "@/web/home/Card";

export const UseCasesSection = () => {
  return (
    <div className="flex flex-col items-center text-center">
      <Typography variant="h4">Using your diagram</Typography>
      <Typography variant="body1">
        Once you've got your diagram, there are a few different ways you can use it.
      </Typography>

      <div className="mt-4 flex flex-wrap justify-center gap-2 text-start md:*:w-56">
        <Card
          title="Grasp your own thoughts"
          description="Lay out your ideas with all of their nuance to better think through a problem and make better decisions for yourself."
        />
        <Card
          title="Solicit feedback"
          description="Send out your diagram for others to leave their feedback on - their questions, suggestions, concerns, and opinions."
        />
        <Card
          title="Guide discussion"
          description="Bring your diagram to a meeting to make it easy to keep the discussion focused, knowing precisely where disagreements or uncertainties lie."
        />
        <Card
          title="Bring others up-to-speed"
          description="Present your diagram or let others click around at their own pace to efficiently catch up about the current state of a problem or solution."
        />
        <Card
          title="Re-visit reasoning"
          description="When new information is discovered, update an old diagram and reconsider it anew."
        />
        <Card
          title="Create decision transparency"
          description="Leave behind a scored diagram after a decision is made, as an explanation of why the decision was the way it was."
        />
      </div>
    </div>
  );
};
