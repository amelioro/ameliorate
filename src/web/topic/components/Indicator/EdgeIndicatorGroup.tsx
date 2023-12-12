import { Stack } from "@mui/material";

import { Edge } from "../../utils/graph";
import { Score } from "../Score/Score";
import { DetailsIndicator } from "./DetailsIndicator";
import { QuestionIndicator } from "./QuestionIndicator";

export const EdgeIndicatorGroup = ({ edge }: { edge: Edge }) => {
  return (
    <Stack direction="row" spacing="2px">
      <QuestionIndicator graphPart={edge} />
      <DetailsIndicator graphPart={edge} />
      <Score graphPartId={edge.id} />
    </Stack>
  );
};
