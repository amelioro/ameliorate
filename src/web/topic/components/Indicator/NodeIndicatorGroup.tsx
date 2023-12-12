import { Stack } from "@mui/material";

import { Node, ProblemNode } from "../../utils/graph";
import { CriteriaTableIndicator } from "../Indicator/CriteriaTableIndicator";
import { Score } from "../Score/Score";
import { DetailsIndicator } from "./DetailsIndicator";
import { QuestionIndicator } from "./QuestionIndicator";

const isProblem = (node: Node): node is ProblemNode => node.type === "problem";

export const NodeIndicatorGroup = ({ node }: { node: Node }) => {
  return (
    <Stack direction="row" margin="2px" spacing="2px">
      <QuestionIndicator graphPart={node} />
      {isProblem(node) && <CriteriaTableIndicator node={node} />}
      <DetailsIndicator graphPart={node} />
      <Score graphPartId={node.id} />
    </Stack>
  );
};
