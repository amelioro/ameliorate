import { Box, Stack, Typography } from "@mui/material";

import { justificationNodeTypes } from "@/common/node";
import { JustificationTreeIndicator } from "@/web/topic/components/Indicator/JustificationTreeIndicator";
import { AddNodeButton } from "@/web/topic/components/Node/AddNodeButton";
import { EditableNode } from "@/web/topic/components/Node/EditableNode";
import { nodeWidthRem } from "@/web/topic/components/Node/EditableNode.styles";
import { useTopLevelJustification } from "@/web/topic/store/graphPartHooks";
import { GraphPart, isNode } from "@/web/topic/utils/graph";
import { isJustificationEdge } from "@/web/topic/utils/justification";

interface Props {
  graphPart: GraphPart;
}

export const DetailsJustificationSection = ({ graphPart }: Props) => {
  const { supports, critiques } = useTopLevelJustification(graphPart.id);

  if (isJustificationEdge(graphPart)) return <></>; // justification edges can't have their own justifications

  const isJustificationNode = isNode(graphPart) && justificationNodeTypes.includes(graphPart.type);

  return (
    <>
      {/* spacing is the amount that centers the add buttons above the columns */}
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        marginBottom="8px"
        spacing={6}
      >
        <AddNodeButton
          fromPartId={graphPart.id}
          as="child"
          toNodeType="support"
          // TODO: remove root claims with edge directly to argued part
          relation={{
            child: "support",
            name: "supports",
            parent: isJustificationNode ? graphPart.type : "rootClaim",
          }}
          selectNewNode={false}
        />
        <JustificationTreeIndicator
          graphPartId={graphPart.data.arguedDiagramPartId ?? graphPart.id}
        />
        <AddNodeButton
          fromPartId={graphPart.id}
          as="child"
          toNodeType="critique"
          // TODO: remove root claims with edge directly to argued part
          relation={{
            child: "critique",
            name: "critiques",
            parent: isJustificationNode ? graphPart.type : "rootClaim",
          }}
          selectNewNode={false}
        />
      </Stack>

      <Box
        className="mb-1 flex flex-wrap justify-center gap-0.5 *:shrink-0"
        // ensure "No X yet!" takes up the same width as the nodes
        sx={{ "& > div": { width: `${nodeWidthRem}rem` } }}
      >
        <div className="flex flex-col items-center gap-0.5">
          {supports.length > 0 ? (
            supports.map((support) => <EditableNode key={support.id} node={support} />)
          ) : (
            <Typography variant="body2">No supports yet!</Typography>
          )}
        </div>

        <div className="flex flex-col items-center gap-0.5">
          {critiques.length > 0 ? (
            critiques.map((critique) => <EditableNode key={critique.id} node={critique} />)
          ) : (
            <Typography variant="body2">No critiques yet!</Typography>
          )}
        </div>
      </Box>
    </>
  );
};
