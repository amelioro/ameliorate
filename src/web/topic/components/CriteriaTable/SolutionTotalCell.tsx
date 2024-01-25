import { Box } from "@mui/material";

import { useSolutionTotal } from "../../store/scoreHooks";
import { Node } from "../../utils/graph";

interface Props {
  solution: Node;
  problem: Node;
}

export const SolutionTotalCell = ({ solution, problem }: Props) => {
  const solutionTotal = useSolutionTotal(solution, problem);
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      {solutionTotal}
    </Box>
  );
};
